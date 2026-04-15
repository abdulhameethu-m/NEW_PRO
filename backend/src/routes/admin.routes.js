const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");
const productController = require("../controllers/product.controller");
const { validate } = require("../middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
  rejectProductSchema,
} = require("../utils/validators/product.validation");

const router = express.Router();

router.use(authRequired, requireRole("admin"));

router.get("/dashboard", adminController.dashboard);
router.get("/analytics", adminController.analytics);

router.get("/users", adminController.listUsers);
router.patch("/users/:id/block", adminController.toggleUserBlocked);
router.delete("/users/:id", adminController.deleteUser);

// Backward-compatible user status endpoint
router.put("/user/:id/status", adminController.setUserStatus);

router.get("/sellers", adminController.listVendors);
router.patch("/sellers/:id/approve", adminController.approveVendor);
router.patch("/sellers/:id/reject", express.json(), adminController.rejectVendor);
router.get("/sellers/:id", adminController.getVendorDetails);

// Backward-compatible vendor routes
router.get("/vendors", adminController.listVendors);
router.get("/vendor/:id", adminController.getVendorDetails);
router.put("/vendor/:id/approve", adminController.approveVendor);
router.put("/vendor/:id/reject", express.json(), adminController.rejectVendor);
router.delete("/vendor/:id", adminController.removeVendor);

router.get("/orders", adminController.listOrders);
router.patch("/orders/:id/status", express.json(), adminController.updateOrderStatus);

router.get("/products", productController.getProducts);
router.post("/products", validate(createProductSchema), productController.createProduct);
router.patch("/products/:id", validate(updateProductSchema), productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/products/pending", productController.getPendingProducts);
router.patch("/products/:id/approve", productController.approveProduct);
router.patch("/products/:id/reject", validate(rejectProductSchema), productController.rejectProduct);
router.get("/products/stats", productController.getProductStats);

module.exports = router;
