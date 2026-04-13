const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  const payload = {
    sub: String(user._id),
    role: user.role,
    email: user.email,
  };

  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn });
}

module.exports = { signAccessToken };

