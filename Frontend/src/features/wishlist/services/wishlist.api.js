import axios from "axios";

const api = axios.create({
  baseURL: "/api/wishlist",
  withCredentials: true,
});

export async function getWishlist() {
  const response = await api.get("/");
  return response.data.products || [];
}

export async function addToWishlist(productId) {
  const response = await api.post(`/${productId}`);
  return response.data;
}

export async function removeFromWishlist(productId) {
  const response = await api.delete(`/${productId}`);
  return response.data;
}
