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
export async function createProductVariant(productId,newProductVariant){

    const formData=new FormData();
    formData.append("title",newProductVariant.title)
    formData.append("description",newProductVariant.description)
    newProductVariant.images.forEach((image)=>{
        formData.append("images",image)
    })

    formData.append("stock",newProductVariant.stock)
    formData.append("priceAmount",newProductVariant.price.amount)
    formData.append("priceCurrency",newProductVariant.price.currency)
    formData.append("attributes",JSON.stringify(newProductVariant.attributes))
    const response=await api.post(`/${productId}/variant`,formData)
    return response.data
}
