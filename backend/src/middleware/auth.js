const { AppError } = require("../utils/AppError");
const { verifyAccessToken } = require("../utils/jwt");
const { hasPermission } = require("../utils/adminPermissions");

function getTokenFromReq(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice("Bearer ".length);
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  return null;
}

function authRequired(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (e) {
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    if (!hasPermission(req.user.role, permission)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  };
}

module.exports = { authRequired, requireRole, requirePermission };
