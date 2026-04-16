const { ok } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const paymentService = require("../services/payment.service");

const createStripeIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createStripePaymentIntent({
    userId: req.user.sub,
    orderIds: req.body?.orderIds,
  });
  return ok(res, result, "Payment intent created");
});

const markStripePaid = asyncHandler(async (req, res) => {
  const result = await paymentService.markStripeOrdersPaid({
    userId: req.user.sub,
    paymentIntentId: req.body?.paymentIntentId,
    orderIds: req.body?.orderIds,
  });
  return ok(res, result, "Payment verified");
});

module.exports = { createStripeIntent, markStripePaid };

