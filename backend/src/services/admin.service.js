const { AppError } = require("../utils/AppError");
const vendorRepo = require("../repositories/vendor.repository");
const userRepo = require("../repositories/user.repository");
const productRepo = require("../repositories/product.repository");
const orderRepo = require("../repositories/order.repository");
const { ORDER_STATUS } = require("../models/Order");
const auditService = require("./audit.service");

async function getDashboardOverview() {
  const [totalUsers, totalSellers, totalOrders, revenue, pendingProducts, pendingSellers] = await Promise.all([
    userRepo.countUsers({ role: "user" }),
    vendorRepo.countVendors(),
    orderRepo.countDocuments(),
    orderRepo.sumRevenue(),
    productRepo.countDocuments({ status: "PENDING" }),
    vendorRepo.countVendors({ status: "pending" }),
  ]);

  return {
    totals: {
      users: totalUsers,
      sellers: totalSellers,
      orders: totalOrders,
      revenue,
    },
    queues: {
      pendingProducts,
      pendingSellers,
    },
  };
}

async function getAnalytics() {
  const [salesOverview, topProducts, orderCount, deliveredOrders, approvedProducts, users, sellers, revenue] = await Promise.all([
    orderRepo.getMonthlyRevenue(6),
    productRepo.getTopProducts(5),
    orderRepo.countDocuments(),
    orderRepo.countDocuments({ status: "Delivered" }),
    productRepo.countDocuments({ status: "APPROVED", isActive: true }),
    userRepo.countUsers({ role: "user" }),
    vendorRepo.countVendors({ status: "approved" }),
    orderRepo.sumRevenue(),
  ]);

  return {
    salesOverview,
    topProducts,
    stats: {
      totalOrders: orderCount,
      deliveredOrders,
      approvedProducts,
      users,
      sellers,
      revenue,
    },
  };
}

async function listVendors({ status } = {}) {
  return await vendorRepo.listVendors({ status });
}

async function getVendorDetails(vendorId) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");
  return vendor;
}

async function listUsers({ role } = {}) {
  return await userRepo.listUsers({ role });
}

async function listAuditLogs(filters = {}) {
  return await auditService.list(filters);
}

async function setUserStatus(userId, status, actor, meta) {
  if (!["active", "disabled"].includes(status)) {
    throw new AppError("Invalid user status", 400, "VALIDATION_ERROR");
  }
  const user = await userRepo.updateById(userId, { status });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  await auditService.log({
    actor,
    action: "admin.user.status_updated",
    entityType: "User",
    entityId: user._id,
    metadata: { status },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return user;
}

async function toggleUserBlocked(userId, actor, meta) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (["admin", "super_admin", "support_admin", "finance_admin"].includes(user.role)) {
    throw new AppError("Admin accounts cannot be blocked", 400, "INVALID_OPERATION");
  }

  const nextStatus = user.status === "disabled" ? "active" : "disabled";
  const updated = await userRepo.updateById(userId, { status: nextStatus });
  await auditService.log({
    actor,
    action: "admin.user.block_toggled",
    entityType: "User",
    entityId: updated._id,
    metadata: { status: nextStatus },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return updated;
}

async function deleteUser(userId, actor, meta) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (["admin", "super_admin", "support_admin", "finance_admin"].includes(user.role)) {
    throw new AppError("Admin accounts cannot be deleted", 400, "INVALID_OPERATION");
  }

  const vendor = user.role === "vendor" ? await vendorRepo.findByUserId(userId) : null;
  if (vendor) {
    await vendorRepo.deleteById(vendor._id);
  }

  await userRepo.deleteById(userId);
  await auditService.log({
    actor,
    action: "admin.user.deleted",
    entityType: "User",
    entityId: userId,
    metadata: { role: user.role },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return { _id: userId };
}

async function approveVendor(vendorId, actor, meta) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");
  if (vendor.status === "approved") return vendor;

  const updated = await vendorRepo.updateById(vendorId, {
    status: "approved",
    rejectionReason: null,
  });
  await auditService.log({
    actor,
    action: "admin.vendor.approved",
    entityType: "Vendor",
    entityId: updated._id,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return updated;
}

async function rejectVendor(vendorId, { reason } = {}, actor, meta) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");

  const updated = await vendorRepo.updateById(vendorId, {
    status: "rejected",
    rejectionReason: reason || "Rejected by admin",
  });
  await auditService.log({
    actor,
    action: "admin.vendor.rejected",
    entityType: "Vendor",
    entityId: updated._id,
    metadata: { reason: reason || "Rejected by admin" },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return updated;
}

async function removeVendor(vendorId, actor, meta) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");

  const userId = vendor.userId?._id || vendor.userId;
  if (!userId) throw new AppError("Linked user not found", 500, "INTERNAL_ERROR");

  await vendorRepo.deleteById(vendorId);

  const updatedUser = await userRepo.updateById(userId, { role: "user" });
  if (!updatedUser) throw new AppError("Linked user not found", 404, "NOT_FOUND");

  await auditService.log({
    actor,
    action: "admin.vendor.removed",
    entityType: "Vendor",
    entityId: vendorId,
    metadata: { linkedUserId: String(userId) },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return { user: updatedUser };
}

async function listOrders(filters = {}) {
  return await orderRepo.list(filters);
}

async function updateOrderStatus(orderId, status, actor, meta) {
  if (!ORDER_STATUS.includes(status)) {
    throw new AppError("Invalid order status", 400, "VALIDATION_ERROR");
  }

  const order = await orderRepo.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  const updated = await orderRepo.updateStatus(orderId, status);
  await auditService.log({
    actor,
    action: "admin.order.status_updated",
    entityType: "Order",
    entityId: updated._id,
    metadata: { status },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  return updated;
}

module.exports = {
  getDashboardOverview,
  getAnalytics,
  listVendors,
  getVendorDetails,
  listUsers,
  listAuditLogs,
  setUserStatus,
  toggleUserBlocked,
  deleteUser,
  approveVendor,
  rejectVendor,
  removeVendor,
  listOrders,
  updateOrderStatus,
};
