import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useToast } from "../../../components/ui/toastContext";
import { addToWishlist, getWishlist, removeFromWishlist } from "../services/wishlist.api";
import { addWishlistItem, removeWishlistItem, setWishlist } from "../state/wishlist.slice";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const user = useSelector((state) => state.auth?.user);
  const items = useSelector((state) => state.wishlist.items);
  const loaded = useSelector((state) => state.wishlist.loaded);

  const handleGetWishlist = useCallback(async () => {
    const products = await getWishlist();
    dispatch(setWishlist(products));
    return products;
  }, [dispatch]);

  const isWishlisted = useCallback((productId) => items.some((p) => p._id === productId), [items]);

  // Optimistic: the heart flips at once and rolls back if the request fails.
  const toggle = useCallback(
    async (product) => {
      if (!user) {
        toast("Sign in to save items to your wishlist", "info");
        navigate("/login", { state: { from: location.pathname + location.search } });
        return;
      }
      const saved = items.some((p) => p._id === product._id);
      dispatch(saved ? removeWishlistItem(product._id) : addWishlistItem(product));
      try {
        await (saved ? removeFromWishlist : addToWishlist)(product._id);
        toast(saved ? "Removed from wishlist" : "Saved to wishlist");
      } catch (error) {
        dispatch(saved ? addWishlistItem(product) : removeWishlistItem(product._id));
        toast(error?.response?.data?.message || "Couldn't update your wishlist. Please try again.", "error");
      }
    },
    [user, items, dispatch, navigate, location, toast]
  );

  return { items, loaded, count: items.length, isWishlisted, toggle, handleGetWishlist };
};
