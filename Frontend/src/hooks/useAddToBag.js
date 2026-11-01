import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useCart } from '../features/cart/hooks/useCart';
import { useToast } from '../components/ui/toastContext';
import { flyToBag } from '../utils/flyToBag';

// Adds one unit of a variant to the bag. Sends guests to login (and back afterwards).
export const useAddToBag = () => {
  const { handleAddItems, handleGetItems } = useCart();
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  return useCallback(
    async (product, variant, sourceEl) => {
      if (!user) {
        toast('Sign in to add items to your bag', 'info');
        navigate('/login', { state: { from: location.pathname + location.search } });
        return false;
      }
      if (!product?._id || !variant?._id) {
        toast('Please choose an option first', 'error');
        return false;
      }
      try {
        await handleAddItems(product._id, variant._id);
        flyToBag(sourceEl);
        await handleGetItems();
        toast(`Added "${product.title}" to your bag`);
        return true;
      } catch (error) {
        toast(error?.response?.data?.message || 'Unable to add item to bag. Please try again.', 'error');
        return false;
      }
    },
    [user, navigate, location, toast, handleAddItems, handleGetItems]
  );
};
