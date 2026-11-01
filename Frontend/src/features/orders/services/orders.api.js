import axios from "axios";

const api = axios.create({
  baseURL: "/api/orders",
  withCredentials: true,
});

export async function getMyOrders() {
  const response = await api.get("/");
  return response.data.orders || [];
}

export async function getOrder(orderId) {
  const response = await api.get(`/${encodeURIComponent(orderId)}`);
  return response.data.order;
}
