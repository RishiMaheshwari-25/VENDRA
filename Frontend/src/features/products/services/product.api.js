import axios from "axios";
const api=axios.create({
    baseURL:"/api/products",
    withCredentials:true
})
export async function createProduct(formData){
    try {
        const response=await api.post("/",formData)
        return response.data
    } catch (error) {
        console.log("Error in creating product",error)
    }
}
export async function getSellerProduct(sellerId){
    try {
        const response=await api.get(`/seller`)
        return response.data
    } catch (error) {
        console.log("Error in getting seller product",error)
    }
}
export async function getAllProducts(){
    const response=await api.get("/");
    return response.data;
}
export async function getProductDetails(productId){
    const response=await api.get(`/${productId}`)
    return response.data;
}
