import { addItems, decrementCartItem, getItems, incrementCartItem } from "../services/cart.api";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setCartData } from "../state/cart.slice";
export const useCart=()=>{
     const dispatch=useDispatch();
     const handleAddItems=async(productId,variantId)=>{
        const data=await addItems(productId,variantId);
        return data
     }
     const handleGetItems=useCallback(async()=>{
      const data=await getItems();
      const cartData=Array.isArray(data.cart) ? data.cart[0] : data.cart;
      dispatch(setCartData({
        items:cartData?.items || [],
        totalPrice:cartData?.totalPrice ?? 0,
        currency:cartData?.currency ?? null
      }))
     },[dispatch]);
     const handleCartItemsQantity=async({productId,variantId})=>{
      return await incrementCartItem({productId,variantId});
     }
     const handleCartItemsDecrement=async({productId,variantId})=>{

        return await decrementCartItem({productId,variantId});
     }
     return {
        handleAddItems,
        handleGetItems,
        handleCartItemsQantity,
        handleCartItemsDecrement
     }
}