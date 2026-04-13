const { AppError } = require("../utils/AppError");
const vendorRepo = require("../repositories/vendor.repository");
const userRepo = require("../repositories/user.repository");

async function listVendors() {
  return await vendorRepo.listVendors();
}

async function getVendorDetails(vendorId) {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404, "NOT_FOUND");
  return vendor;
}

async function listUsers() {
  return await userRepo.listUsers();
}

async function setUserStatus(userId, status) {
  if (!["active", "disabled"].includes(status)) {
    throw new AppError("Invalid user status", 400, "VALIDATION_ERROR");
  }
  const user = await userRepo.updateById(userId, { status });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return user;
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

  // Remove vendor profile entirely
  await vendorRepo.deleteById(vendorId);

  // Revoke vendor privilege: vendor -> user
  const updatedUser = await userRepo.updateById(userId, { role: "user" });
  if (!updatedUser) throw new AppError("Linked user not found", 404, "NOT_FOUND");

  return { user: updatedUser };
}

module.exports = {
  listVendors,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  removeVendor,
  listUsers,
  setUserStatus,
};

