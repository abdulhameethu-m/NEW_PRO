const express = require("express");
const { authRequired } = require("../middleware/auth");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.use(authRequired);

router.post("/stripe/create-intent", paymentController.createStripeIntent);
router.post("/stripe/verify", paymentController.markStripePaid);

module.exports = router;

