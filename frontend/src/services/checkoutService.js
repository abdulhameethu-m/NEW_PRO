import { api } from "./api";

export async function prepareCheckout(payload = {}) {
  const { data } = await api.post("/api/checkout/prepare", payload);
  return data;
}

