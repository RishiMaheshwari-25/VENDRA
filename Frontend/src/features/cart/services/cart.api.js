import axios from "axios";
const api=axios.create({
    baseURL:"/api/cart",
    withCredentials:true
})
export async function addItems(productId,variantId){
  const response=await api.post(`/add/${productId}/${variantId}`,{
    quantity:1
  })
  return response.data;
}
export async function getItems(){
  const response=await api.get("/");
  return response.data; 
}
export async function incrementCartItem({productId,variantId}){
  const response=await api.patch(`/quantity/increment/${productId}/${variantId}`)
  return response.data;
}
export async function decrementCartItem({productId,variantId}){
  const response=await api.patch(`/quantity/decrement/${productId}/${variantId}`);
  return response.data;
}
export async function createCartOrder(){
  const response=await api.post("/payment/create/order");
  return response.data
}
export async function verifyCartOrder({razorpay_order_id,razorpay_payment_id,razorpay_signature}){
const response=await api.post("/payment/verify/order",{
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
})
return response.data
}
export async function getOrderById(orderId){
  const response=await api.get(`/payment/order/${encodeURIComponent(orderId)}`);
  return response.data;
}
