import { addItems } from "../services/cart.api";
import { useDispatch } from "react-redux";
import { addItems as addItemsToCart } from "../state/cart.slice";
export const useCart=()=>{
     const dispatch=useDispatch();
     const handleAddItems=async(productId,variantId)=>{
        const data=await addItems(productId,variantId);
        // dispatch(addItemsToCart(response));
        return data
     }
     return {
        handleAddItems
     }
}