import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import '../../../styles/wishlist.scss';

// Heart toggle. Hidden for seller accounts (wishlists are for shoppers).
const WishlistButton = ({ product, className = '', size = 18 }) => {
  const role = useSelector((state) => state.auth?.user?.role);
  const { isWishlisted, toggle } = useWishlist();
  if (role === 'seller' || !product?._id) return null;

  const on = isWishlisted(product._id);
  return (
    <motion.button
      type="button"
      className={`wish ${on ? 'is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
      title={on ? 'Remove from wishlist' : 'Save to wishlist'}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
    >
      <motion.span
        key={on ? 'on' : 'off'}
        initial={{ scale: on ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 12 }}
        style={{ display: 'grid' }}
      >
        <Heart size={size} fill={on ? 'currentColor' : 'none'} />
      </motion.span>
    </motion.button>
  );
};

export default WishlistButton;
