const { AppError } = require("../utils/AppError");
const vendorRepo = require("../repositories/vendor.repository");
const userRepo = require("../repositories/user.repository");
const productRepo = require("../repositories/product.repository");
const orderRepo = require("../repositories/order.repository");
const { ORDER_STATUS } = require("../models/Order");

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

async function setUserStatus(userId, status) {
  if (!["active", "disabled"].includes(status)) {
    throw new AppError("Invalid user status", 400, "VALIDATION_ERROR");
  }
  const user = await userRepo.updateById(userId, { status });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return user;
}

async function toggleUserBlocked(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.role === "admin") {
    throw new AppError("Admin accounts cannot be blocked", 400, "INVALID_OPERATION");
  }

  const nextStatus = user.status === "disabled" ? "active" : "disabled";
  return await userRepo.updateById(userId, { status: nextStatus });
}

async function deleteUser(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.role === "admin") {
    throw new AppError("Admin accounts cannot be deleted", 400, "INVALID_OPERATION");
  }

  const vendor = user.role === "vendor" ? await vendorRepo.findByUserId(userId) : null;
  if (vendor) {
    await vendorRepo.deleteById(vendor._id);
  }

  await userRepo.deleteById(userId);
  return { _id: userId };
}

async function approveVendor(vendorId) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");
  if (vendor.status === "approved") return vendor;

  return await vendorRepo.updateById(vendorId, {
    status: "approved",
    rejectionReason: null,
  });
}

async function rejectVendor(vendorId, { reason } = {}) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");

  return await vendorRepo.updateById(vendorId, {
    status: "rejected",
    rejectionReason: reason || "Rejected by admin",
  });
}

async function removeVendor(vendorId) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");

  const userId = vendor.userId?._id || vendor.userId;
  if (!userId) throw new AppError("Linked user not found", 500, "INTERNAL_ERROR");

  await vendorRepo.deleteById(vendorId);

  const updatedUser = await userRepo.updateById(userId, { role: "user" });
  if (!updatedUser) throw new AppError("Linked user not found", 404, "NOT_FOUND");

  return { user: updatedUser };
}

async function listOrders(filters = {}) {
  return await orderRepo.list(filters);
}

async function updateOrderStatus(orderId, status) {
  if (!ORDER_STATUS.includes(status)) {
    throw new AppError("Invalid order status", 400, "VALIDATION_ERROR");
  }

  const order = await orderRepo.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  return await orderRepo.updateStatus(orderId, status);
}

module.exports = {
  getDashboardOverview,
  getAnalytics,
  listVendors,
  getVendorDetails,
  listUsers,
  setUserStatus,
  toggleUserBlocked,
  deleteUser,
  approveVendor,
  rejectVendor,
  removeVendor,
  listOrders,
  updateOrderStatus,
};
