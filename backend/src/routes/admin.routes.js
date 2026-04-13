const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.use(authRequired, requireRole("admin"));

router.get("/vendors", adminController.listVendors);
router.get("/vendor/:id", adminController.getVendorDetails);
router.get("/users", adminController.listUsers);
router.put("/user/:id/status", adminController.setUserStatus);
router.put("/vendor/:id/approve", adminController.approveVendor);
router.put("/vendor/:id/reject", express.json(), adminController.rejectVendor);
router.delete("/vendor/:id", adminController.removeVendor);

module.exports = router;

