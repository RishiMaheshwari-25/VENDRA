import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { fadeUp } from '../ui/motion';
import { useSelector } from 'react-redux';
import { Check, Plus } from 'lucide-react';
import ProductImage from './ProductImage';
import WishlistButton from '../../features/wishlist/components/WishlistButton';
import { useAddToBag } from '../../hooks/useAddToBag';
import { firstAvailableVariant, formatPrice, productGallery, stockStatus } from '../../utils/product';
import '../../styles/product-card.scss';

const BADGES = { out: 'Sold out', low: 'Low stock' };

const ProductCard = ({ product, style, highlight }) => {
  const user = useSelector((state) => state.auth?.user);
  const addToBag = useAddToBag();
  const mediaRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | busy | done

  const images = productGallery(product);
  const status = stockStatus(product);
  const variants = product.variants || [];
  const available = firstAvailableVariant(product);
  const canBuy = user?.role !== 'seller';
  const to = `/product/${product._id}`;

  // One purchasable option -> add directly. Several options -> let the shopper choose.
  const needsChoice = variants.filter((v) => Number(v.stock) > 0).length > 1;

  const onAdd = async () => {
    setState('busy');
    const ok = await addToBag(product, available, mediaRef.current);
    setState(ok ? 'done' : 'idle');
    if (ok) setTimeout(() => setState('idle'), 1600);
  };

  return (
    <motion.article className="pc" style={style} variants={fadeUp}>
      <div className="pc__media-wrap" ref={mediaRef}>
        <Link to={to} className="pc__media" aria-label={product.title}>
          <ProductImage src={images[0]} alt={product.title} className="pc__img" />
          {images[1] && <ProductImage src={images[1]} alt="" className="pc__img pc__img--alt" aria-hidden="true" />}
        </Link>

        <WishlistButton product={product} className="pc__wish" size={17} />

        {BADGES[status] && <span className={`pc__badge pc__badge--${status}`}>{BADGES[status]}</span>}

        {canBuy && status !== 'none' && status !== 'out' &&
          (needsChoice ? (
            <Link to={to} className="pc__add">
              <span>Select options</span>
            </Link>
          ) : (
            <button type="button" className="pc__add" onClick={onAdd} disabled={state === 'busy'}>
              {state === 'done' ? <Check size={14} /> : state === 'busy' ? <span className="spinner" /> : <Plus size={14} />}
              <span>{state === 'done' ? 'Added' : 'Add to bag'}</span>
            </button>
          ))}
      </div>

      <Link to={to} className="pc__info">
        <h3 className="pc__title">{highlight ? highlight(product.title) : product.title}</h3>
        <span className="pc__price">{formatPrice(product.price)}</span>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
