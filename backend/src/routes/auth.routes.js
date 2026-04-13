const express = require("express");
const { validate } = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema } = require("../utils/validators/auth.validation");
const { AppError } = require("../utils/AppError");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  (req, res, next) => {
    if (req.body.role === "admin" && process.env.ALLOW_ADMIN_REGISTRATION !== "true") {
      return next(new AppError("Admin registration disabled", 403, "FORBIDDEN"));
    }
    next();
  },
  authController.register
);

router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authRequired, authController.me);

module.exports = router;

