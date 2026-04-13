import { api } from "./api";

export async function listVendors() {
  const { data } = await api.get("/api/admin/vendors");
  return data;
}

export async function getVendorDetails(id) {
  const { data } = await api.get(`/api/admin/vendor/${id}`);
  return data;
}

export async function approveVendor(id) {
  const { data } = await api.put(`/api/admin/vendor/${id}/approve`);
  return data;
}

export async function rejectVendor(id, reason) {
  const { data } = await api.put(`/api/admin/vendor/${id}/reject`, { reason });
  return data;
}

export async function removeVendor(id) {
  const { data } = await api.delete(`/api/admin/vendor/${id}`);
  return data;
}

