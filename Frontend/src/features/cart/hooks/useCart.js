import { addItems, createCartOrder, decrementCartItem, getItems, getOrderById, incrementCartItem, verifyCartOrder } from "../services/cart.api";
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
     const handleCreateCartOrder=async()=>{
      const data=await createCartOrder();
      return data.order;
     }
     const handleVerifyCartOrder=async({razorpay_order_id,razorpay_payment_id,razorpay_signature})=>{
      const data=await verifyCartOrder({razorpay_order_id,razorpay_payment_id,razorpay_signature});
      return data.success
     }
     const handleGetOrder=useCallback(async(orderId)=>{
      const data=await getOrderById(orderId);
      return data.order;
     },[]);
     return {
        handleGetOrder,
        handleAddItems,
        handleGetItems,
        handleCartItemsQantity,
        handleCartItemsDecrement,
        handleCreateCartOrder,
        handleVerifyCartOrder
     }
}