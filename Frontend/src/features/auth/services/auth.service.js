import axios from "axios";
const api=axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})
export const register=async ({email,password,contact,fullname,isSeller})=>{
   
        const response=await api.post("/api/auth/register",{email,password,fullname,contact,isSeller});
        return response.data
     
}
export const login=async({email,password})=>{
    const response=await api.post("/api/auth/login",{email,password});
    return response.data;
}
    