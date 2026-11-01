import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, Heart } from 'lucide-react';
import ProductCard from '../../../components/product/ProductCard';
import { Stagger } from '../../../components/ui/Reveal';
import { useWishlist } from '../hooks/useWishlist';
import '../../../styles/wishlist.scss';
import '../../../styles/product-card.scss';

const Wishlist = () => {
  const { items, loaded, handleGetWishlist } = useWishlist();
  const [error, setError] = useState(false);

  useEffect(() => {
    handleGetWishlist().catch(() => setError(true));
  }, [handleGetWishlist]);

  const retry = () => {
    setError(false);
    handleGetWishlist().catch(() => setError(true));
  };

  return (
    <div className="container wl">
      <header className="wl__head">
        <span className="eyebrow">Saved for later</span>
        <h1>
          Wishlist <small>{loaded && items.length > 0 ? `(${items.length} ${items.length === 1 ? 'item' : 'items'})` : ''}</small>
        </h1>
      </header>

      {error && !loaded ? (
        <div className="empty">
          <div className="empty__icon"><AlertCircle size={26} /></div>
          <h2>We couldn’t load your wishlist</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className="btn--solid" onClick={retry}><span>Try again</span></button>
        </div>
      ) : !loaded ? (
        <div className="pgrid pgrid--4 pgrid--skeleton" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div className="empty__icon"><Heart size={26} /></div>
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/search" className="btn--solid"><span>Browse products</span></Link>
        </div>
      ) : (
        <Stagger className="pgrid pgrid--4" gap={0.05}>
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </Stagger>
      )}
    </div>
  );
};

export default Wishlist;
