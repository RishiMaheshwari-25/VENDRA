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
