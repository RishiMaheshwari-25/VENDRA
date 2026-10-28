import { createSlice } from "@reduxjs/toolkit";
const cartSlice = createSlice({
    name:"cart",
    initialState:{
        items:[],
    },
    reducers:{
       setItems:(state,action)=>{
        state.items=action.payload
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
export const {setItems,addItems,incrementCartQuantity,decrementCartQuantity}=cartSlice.actions;
export default cartSlice.reducer;