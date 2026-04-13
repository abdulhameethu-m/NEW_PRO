const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().allow("", null),
  phone: Joi.string().trim().min(6).max(30).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("user", "vendor").default("user"),
}).custom((value, helpers) => {
  if (value.role === "vendor") {
    if (!value.email) return helpers.error("any.custom", { message: "Email is required for vendors" });
  }
  return value;
}, "Role-based register rules");

const loginSchema = Joi.object({
  identifier: Joi.string().trim().min(3).max(120).required(),
  password: Joi.string().min(8).max(128).required(),
});

module.exports = { registerSchema, loginSchema };

