const mongoose = require("mongoose");
const { AppError } = require("../utils/AppError");
const cartRepo = require("../repositories/cart.repository");
const productRepo = require("../repositories/product.repository");
const orderRepo = require("../repositories/order.repository");
const payoutRepo = require("../repositories/payout.repository");

function asObjectId(id, fieldName) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`Invalid ${fieldName}`, 400, "VALIDATION_ERROR");
  return id;
}

function groupBySeller(items = []) {
  const map = new Map();
  for (const it of items) {
    const key = String(it.sellerId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  return map;
}

class CheckoutService {
  async prepare(userId, { currency } = {}) {
    const cart = await cartRepo.findByUserId(userId);
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400, "EMPTY_CART");
    }

    // Validate & refresh prices
    const validated = [];
    for (const item of cart.items) {
      asObjectId(item.productId, "productId");
      const product = await productRepo.findById(item.productId);
      if (!product) throw new AppError("Product not found", 404, "NOT_FOUND");
      if (product.status !== "APPROVED" || product.isActive !== true) {
        throw new AppError(`Product not available: ${product.name}`, 400, "NOT_AVAILABLE");
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Out of stock: ${product.name}`, 400, "INSUFFICIENT_STOCK");
      }
      if (!product.sellerId) throw new AppError("Seller not found for product", 400, "INVALID_PRODUCT");

      validated.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        image: Array.isArray(product.images) && product.images.length ? product.images[0]?.url : undefined,
        quantity: item.quantity,
        price: Number(product.discountPrice || product.price || 0),
        maxAvailable: product.stock,
      });
    }

    const bySeller = groupBySeller(validated);
    const sellers = Array.from(bySeller.entries()).map(([sellerId, items]) => {
      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      return { sellerId, items, subtotal };
    });

    const subtotal = sellers.reduce((sum, s) => sum + s.subtotal, 0);
    const shippingFee = 0;
    const taxAmount = 0;
    const totalAmount = subtotal + shippingFee + taxAmount;

    return {
      currency: currency || cart.currency || "INR",
      sellers,
      subtotal,
      shippingFee,
      taxAmount,
      totalAmount,
    };
  }

  async createOrder(userId, { shippingAddress, paymentMethod = "ONLINE" }) {
    const cart = await cartRepo.findByUserId(userId);
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400, "EMPTY_CART");
    }

    // Validate & refresh prices
    const validated = [];
    for (const item of cart.items) {
      const product = await productRepo.findById(item.productId);
      if (!product) throw new AppError("Product not found", 404, "NOT_FOUND");
      if (product.status !== "APPROVED" || product.isActive !== true) {
        throw new AppError(`Product not available: ${product.name}`, 400, "NOT_AVAILABLE");
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Out of stock: ${product.name}`, 400, "INSUFFICIENT_STOCK");
      }

      validated.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: Number(product.discountPrice || product.price || 0),
        quantity: item.quantity,
        image: Array.isArray(product.images) && product.images.length ? product.images[0]?.url : undefined,
      });
    }

    const bySeller = groupBySeller(validated);
    const orders = [];
    const payouts = [];

    for (const [sellerId, items] of bySeller) {
      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const shippingFee = 0; // Calculate per seller or global
      const taxAmount = 0;
      const totalAmount = subtotal + shippingFee + taxAmount;
      const commission = totalAmount * 0.1; // 10% commission, configurable
      const sellerAmount = totalAmount - commission;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const orderData = {
        orderNumber,
        userId,
        sellerId,
        items,
        subtotal,
        shippingFee,
        taxAmount,
        totalAmount,
        currency: "INR",
        status: "Placed",
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending", // For online, will be updated after payment
        paymentMethod,
        shippingAddress,
        timeline: [{ status: "Placed", note: "Order placed" }],
      };

      const order = await orderRepo.create(orderData);
      orders.push(order);

      // Create payout record
      payouts.push({
        sellerId,
        orderId: order._id,
        amount: sellerAmount,
        commission,
        status: "PENDING",
      });
    }

    // Save payouts
    for (const payout of payouts) {
      await payoutRepo.create(payout);
    }

    // Clear cart
    await cartRepo.clear(userId);

    return { orders, payouts };
  }
}

module.exports = new CheckoutService();

