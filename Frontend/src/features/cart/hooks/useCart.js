import { addItems,getItems} from "../services/cart.api";
import { useDispatch } from "react-redux";
import { addItems as addItemsToCart, setItems } from "../state/cart.slice";
export const useCart=()=>{
     const dispatch=useDispatch();
     const handleAddItems=async(productId,variantId)=>{
        const data=await addItems(productId,variantId);
        // dispatch(addItemsToCart(response));
        return data
     }
     const handleGetItems=async()=>{
      const data=await getItems();
      dispatch(setItems(data.cart.items))
     }
     return {
        handleAddItems,
        handleGetItems
     }
}