import { api } from "./api";

export async function createStripeIntent(orderIds = []) {
  const { data } = await api.post("/api/payments/stripe/create-intent", { orderIds });
  return data;
}

export async function verifyStripePayment({ paymentIntentId, orderIds }) {
  const { data } = await api.post("/api/payments/stripe/verify", { paymentIntentId, orderIds });
  return data;
}

