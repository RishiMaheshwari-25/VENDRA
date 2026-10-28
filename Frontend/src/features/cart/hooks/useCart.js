import { addItems, decrementCartItem, getItems, incrementCartItem } from "../services/cart.api";
import { useDispatch } from "react-redux";
import { setItems } from "../state/cart.slice";
export const useCart=()=>{
     const dispatch=useDispatch();
     const handleAddItems=async(productId,variantId)=>{
        const data=await addItems(productId,variantId);
        return data
     }
     const handleGetItems=async()=>{
      const data=await getItems();
      dispatch(setItems(data.cart.items))
     }
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