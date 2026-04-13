const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { upload } = require("../middleware/upload");
const vendorController = require("../controllers/vendor.controller");
const {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} = require("../utils/validators/vendor.validation");

const router = express.Router();

router.use(authRequired, requireRole("vendor"));

router.post("/step1", validate(step1Schema), vendorController.step1);
router.post(
  "/step2",
  upload.array("documents", 10),
  validate(step2Schema),
  vendorController.step2
);
router.post("/step3", validate(step3Schema), vendorController.step3);
router.post(
  "/step4",
  upload.array("shopImages", 5),
  validate(step4Schema),
  vendorController.step4
);

router.get("/me", vendorController.me);

module.exports = router;

