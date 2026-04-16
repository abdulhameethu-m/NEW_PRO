import { api } from "./api";

export async function getCart() {
  const { data } = await api.get("/api/cart");
  return data;
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await api.post("/api/cart/add", { productId, quantity });
  return data;
}

export async function updateCartItem(productId, quantity) {
  const { data } = await api.patch("/api/cart/update", { productId, quantity });
  return data;
}

export async function removeCartItem(productId) {
  const { data } = await api.delete("/api/cart/remove", { data: { productId } });
  return data;
}

export async function clearCart() {
  const { data } = await api.delete("/api/cart/clear");
  return data;
}

