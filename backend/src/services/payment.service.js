const Stripe = require("stripe");
const { AppError } = require("../utils/AppError");
const orderRepo = require("../repositories/order.repository");

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new AppError("Stripe is not configured", 500, "STRIPE_NOT_CONFIGURED");
  return new Stripe(key);
}

function toMinor(amount, currency) {
  const c = String(currency || "INR").toUpperCase();
  // Most common currencies are 2-decimal.
  const factor = 100;
  const minor = Math.round(Number(amount || 0) * factor);
  if (!Number.isFinite(minor) || minor < 0) throw new AppError("Invalid amount", 400, "VALIDATION_ERROR");
  return { amount: minor, currency: c.toLowerCase() };
}

class PaymentService {
  async createStripePaymentIntent({ userId, orderIds = [] }) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new AppError("orderIds is required", 400, "VALIDATION_ERROR");
    }

    const orders = [];
    for (const id of orderIds) {
      const order = await orderRepo.findByIdForUser(id, userId);
      if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
      if (order.paymentStatus !== "Pending") {
        throw new AppError("Order is not payable", 400, "INVALID_OPERATION");
      }
      orders.push(order);
    }

    const currency = orders[0].currency || "INR";
    if (orders.some((o) => String(o.currency || "INR") !== String(currency))) {
      throw new AppError("All orders must have the same currency", 400, "VALIDATION_ERROR");
    }

    const total = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const { amount, currency: stripeCurrency } = toMinor(total, currency);

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: stripeCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(userId),
        orderIds: orders.map((o) => String(o._id)).join(","),
      },
    });

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id, amount, currency: stripeCurrency };
  }

  async markStripeOrdersPaid({ userId, paymentIntentId, orderIds = [] }) {
    if (!paymentIntentId) throw new AppError("paymentIntentId is required", 400, "VALIDATION_ERROR");
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new AppError("orderIds is required", 400, "VALIDATION_ERROR");
    }

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!intent) throw new AppError("Payment not found", 404, "NOT_FOUND");

    const intentOrderIds = String(intent.metadata?.orderIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const requested = orderIds.map(String);
    const allMatch = requested.every((id) => intentOrderIds.includes(id));
    if (!allMatch) throw new AppError("Payment does not match orders", 400, "VALIDATION_ERROR");
    if (String(intent.metadata?.userId || "") !== String(userId)) {
      throw new AppError("Payment does not belong to user", 403, "FORBIDDEN");
    }

    const status = intent.status;
    const nextPaymentStatus = status === "succeeded" ? "Paid" : status === "canceled" ? "Failed" : "Pending";

    const updated = [];
    for (const id of requested) {
      const order = await orderRepo.findByIdForUser(id, userId);
      if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
      if (order.paymentStatus !== nextPaymentStatus) {
        await orderRepo.updatePaymentStatus(id, nextPaymentStatus);
      }
      updated.push(id);
    }

    return { paymentIntentId, stripeStatus: status, paymentStatus: nextPaymentStatus, orderIds: updated };
  }
}

module.exports = new PaymentService();

