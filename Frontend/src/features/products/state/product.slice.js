import { createSlice } from "@reduxjs/toolkit";
 export const productSlice=createSlice({
      name:"product",
      initialState:{
            products:[],
            loading:false,
            error:null
      },
      reducers:{
            setSellerProducts:(state,action)=>{
                  state.products=action.payload
            },
            setLoading:(state,action)=>{
                  state.loading=action.payload
            },
            setError:(state,action)=>{
                  state.error=action.payload
            }
      }
 })
 export const {setSellerProducts,setLoading,setError}=productSlice.actions;
 export default productSlice.reducer