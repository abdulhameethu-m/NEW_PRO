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

router.get("/vendors", adminController.listVendors);
router.get("/vendor/:id", adminController.getVendorDetails);
router.get("/users", adminController.listUsers);
router.put("/user/:id/status", adminController.setUserStatus);
router.put("/vendor/:id/approve", adminController.approveVendor);
router.put("/vendor/:id/reject", express.json(), adminController.rejectVendor);
router.delete("/vendor/:id", adminController.removeVendor);

/**
 * ==========================================
 * ADMIN PRODUCT MANAGEMENT (Flipkart-style)
 * Base: /api/admin/products
 * ==========================================
 */

// List all products (admin can see all)
router.get("/products", productController.getProducts);

// Create product as admin (auto-approved by existing logic)
router.post("/products", validate(createProductSchema), productController.createProduct);

// Update any product
router.patch("/products/:id", validate(updateProductSchema), productController.updateProduct);

// Delete any product (soft delete)
router.delete("/products/:id", productController.deleteProduct);

// Approval queue
router.get("/products/pending", productController.getPendingProducts);
router.patch("/products/:id/approve", productController.approveProduct);
router.patch("/products/:id/reject", validate(rejectProductSchema), productController.rejectProduct);
router.get("/products/stats", productController.getProductStats);

module.exports = router;

