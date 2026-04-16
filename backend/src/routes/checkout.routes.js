const express = require("express");
const { authRequired } = require("../middleware/auth");
const checkoutController = require("../controllers/checkout.controller");

const router = express.Router();

router.use(authRequired);

router.post("/prepare", checkoutController.prepare);
router.post("/create", checkoutController.createOrder);

module.exports = router;

