const { ok } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ok(res, result, "Registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ok(res, result, "Logged in successfully");
});

const me = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const user = await authService.me(userId);
  return ok(res, user, "OK");
});

module.exports = { register, login, me };

