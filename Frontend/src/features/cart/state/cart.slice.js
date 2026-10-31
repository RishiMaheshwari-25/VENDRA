import { createSlice } from "@reduxjs/toolkit";
const cartSlice = createSlice({
    name:"cart",
    initialState:{
        items:[],
        totalPrice:0,
        currency:null,
    },
    reducers:{
       setItems:(state,action)=>{
        state.items=action.payload
},
      setCartData:(state,action)=>{
        state.items=action.payload.items;
        state.totalPrice=action.payload.totalPrice;
        state.currency=action.payload.currency;
      },
      addItems:(state,action)=>{
        state.items.push(action.payload);
      },
      decrementCartQuantity:(state,action)=>{
        const {productId,variantId}=action.payload;
        state.items=state.items.map((item)=>{
          if(item._id==productId && item.variant._id==variantId){
            return {...item,quantity:item.quantity-1};
          }
          else{
           return item;}
        })
      },
      incrementCartQuantity:(state,action)=>{
        const {productId,variantId}=action.payload;
        state.items=state.items.map((item)=>{
          if(item._id==productId && item.variant._id==variantId){
            return {...item,quantity:item.quantity+1};
          }
          else{
           return item;}
        })
      }
    }
})
export const {setItems,setCartData,addItems,incrementCartQuantity,decrementCartQuantity}=cartSlice.actions;
export default cartSlice.reducer;