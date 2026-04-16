const { ok } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const checkoutService = require("../services/checkout.service");

const prepare = asyncHandler(async (req, res) => {
  const result = await checkoutService.prepare(req.user.sub, req.body || {});
  return ok(res, result, "Checkout prepared");
});

module.exports = { prepare };

