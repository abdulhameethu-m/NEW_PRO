const { ok } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const adminService = require("../services/admin.service");
const { AppError } = require("../utils/AppError");

const listVendors = asyncHandler(async (req, res) => {
  const vendors = await adminService.listVendors();
  return ok(res, vendors, "OK");
});

const getVendorDetails = asyncHandler(async (req, res) => {
  const vendor = await adminService.getVendorDetails(req.params.id);
  return ok(res, vendor, "OK");
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  return ok(res, users, "OK");
});

const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!status) throw new AppError("Missing status", 400, "VALIDATION_ERROR");
  const user = await adminService.setUserStatus(req.params.id, status);
  return ok(res, user, "User updated");
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await adminService.approveVendor(req.params.id);
  return ok(res, vendor, "Vendor approved");
});

const rejectVendor = asyncHandler(async (req, res) => {
  const reason = req.body?.reason;
  if (reason && typeof reason !== "string") {
    throw new AppError("Invalid rejection reason", 400, "VALIDATION_ERROR");
  }
  const vendor = await adminService.rejectVendor(req.params.id, { reason });
  return ok(res, vendor, "Vendor rejected");
});

const removeVendor = asyncHandler(async (req, res) => {
  const result = await adminService.removeVendor(req.params.id);
  return ok(res, result, "Vendor removed and privileges revoked");
});

module.exports = {
  listVendors,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  removeVendor,
  listUsers,
  setUserStatus,
};

