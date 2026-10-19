
import { getSellerProduct, createProduct,getAllProducts,getProductDetails,createProductVariant } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setLoading, setError,setProducts } from "../state/product.slice";

export const useProduct = () => { 
  const dispatch = useDispatch();

  async function handleCreateProduct(formData) {
    try {
      dispatch(setLoading(true));
      setError(null);
      const data = await createProduct(formData);
      return data?.product || data;
    } catch (err) {
      dispatch(setError(err?.message || "Failed to create product"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetSellerProduct() {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getSellerProduct();
      const products = data?.products || (Array.isArray(data) ? data : []);
      dispatch(setSellerProducts(products));
      return products;
    } catch (err) {
      console.error("Error in fetching seller products:", err);
      dispatch(setError(err?.message || "Failed to fetch products"));
      dispatch(setSellerProducts([]));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }
  async function handleGetAllProducts() {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getAllProducts();
      const list = data?.products || (Array.isArray(data) ? data : []);
      dispatch(setProducts(list));
      return list;
    } catch (err) {
      console.error("Error in fetching all products:", err);
      dispatch(setError(err?.message || "Failed to fetch products"));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }
  async function handleGetProductDetail(productId){
    const data=await getProductDetails(productId);
     return data.product;
    
  }
  async function handleCreateProductVariant(productId,newProductVariant){
    const data=await createProductVariant(productId,newProductVariant);
    return data;
  }

  return { handleCreateProduct, handleGetSellerProduct,handleGetAllProducts ,handleGetProductDetail,handleCreateProductVariant};
};