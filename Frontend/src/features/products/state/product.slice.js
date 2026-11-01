import { createSlice } from "@reduxjs/toolkit";
 export const productSlice=createSlice({
      name:"product",
      initialState:{
            sellerProducts:[],
            products:[],
            loaded:false,
            loading:false,
            error:null

      },
      reducers:{
            setSellerProducts:(state,action)=>{
                  state.sellerProducts=action.payload
            },
            setProducts:(state,action)=>{
            state.products=action.payload
            state.loaded=true
            },
            setProductsLoaded:(state)=>{
            state.loaded=true
            },
            setLoading:(state,action)=>{
                  state.loading=action.payload
            },
            setError:(state,action)=>{
                  state.error=action.payload
            }
      }
 })
 export const {setSellerProducts,setProducts,setProductsLoaded,setLoading,setError}=productSlice.actions;
 export default productSlice.reducer