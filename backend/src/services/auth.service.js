const bcrypt = require("bcryptjs");
const { AppError } = require("../utils/AppError");
const { signAccessToken } = require("../utils/jwt");
const userRepo = require("../repositories/user.repository");

async function register({ name, email, phone, password, role }) {
  const normalizedEmail = email ? String(email).toLowerCase() : null;

  if (role === "vendor" && !normalizedEmail) {
    throw new AppError("Email is required for vendors", 400, "VALIDATION_ERROR");
  }

  if (normalizedEmail) {
    const existing = await userRepo.findByEmail(normalizedEmail);
    if (existing) throw new AppError("Email already in use", 409, "EMAIL_EXISTS");
  }

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) throw new AppError("Phone already in use", 409, "PHONE_EXISTS");

  const hashed = await bcrypt.hash(password, 12);
  const user = await userRepo.createUser({
    name,
    email: normalizedEmail,
    phone: String(phone).trim(),
    password: hashed,
    role,
    status: "active",
  });

  const token = signAccessToken(user);
  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}

async function login({ identifier, password }) {
  const id = String(identifier || "").trim();
  const isEmail = id.includes("@");

  const user = isEmail
    ? await userRepo.findByEmail(id, { includePassword: true })
    : await userRepo.findByPhone(id, { includePassword: true });

  if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  if (user.status !== "active") throw new AppError("Account disabled", 403, "ACCOUNT_DISABLED");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const token = signAccessToken(user);
  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}

async function me(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

module.exports = { register, login, me };

