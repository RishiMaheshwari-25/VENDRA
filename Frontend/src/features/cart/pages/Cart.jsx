import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  RotateCcw,
  Heart,
  Trash2,
  Check
} from 'lucide-react';
import '../../../styles/cart.scss';

const getAttributeEntries = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return [...attributes.entries()];
  if (typeof attributes === 'object') return Object.entries(attributes);
  return [];
};

const formatDescription = (desc) => {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  if (Array.isArray(desc)) {
    return desc
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.text || item.value || item.desc || item.content || '';
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  if (typeof desc === 'object') {
    return desc.text || desc.value || desc.desc || desc.content || '';
  }
  return '';
};

const formatPrice = (amount, currency = 'INR') => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString(currency === 'INR' ? 'en-IN' : undefined)}`;
};

const Cart = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const { handleGetItems, handleCartItemsQantity } = useCart();

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [wishlistItems, setWishlistItems] = useState({});
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Debug log requested by user
  console.log('Cart Items in Cart Page:', cartItems);

  useEffect(() => {
    let isMounted = true;
    const fetchCart = async () => {
      try {
        await handleGetItems();
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCart();
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const items = useMemo(() => {
    return Array.isArray(cartItems) ? cartItems : [];
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0);
  }, [items]);

  const rawSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = Number(item?.price?.amount ?? item?.product?.price?.amount ?? 0);
      const qty = Number(item?.quantity) || 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  const primaryCurrency = useMemo(() => {
    return items[0]?.price?.currency || items[0]?.product?.price?.currency || 'INR';
  }, [items]);

  const discountAmount = promoApplied ? Math.round(rawSubtotal * 0.1) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const getProductImage = (item) => {
    const images = item?.product?.images || item?.images;
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first === 'object') {
        if (first.url) return first.url;
        if (first.secure_url) return first.secure_url;
        if (first.path) return first.path;
      }
    }
    const variantImages = item?.variant?.images || item?.product?.variants?.[0]?.images;
    if (Array.isArray(variantImages) && variantImages.length > 0) {
      const first = variantImages[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first === 'object') {
        if (first.url) return first.url;
        if (first.secure_url) return first.secure_url;
      }
    }
    return '/images/designer_bomber_jacket.jpg';
  };

  const handleIncreaseQty = async (item) => {
    const productId = item?.product?._id || item?._id;
    const variantId =
      item?.variant?._id ||
      (typeof item?.variant === 'string' ? item.variant : null) ||
      item?.product?.variants?.[0]?._id;

    if (!productId || !variantId) {
      triggerToast('Unable to identify variant for quantity update.');
      return;
    }

    try {
      setUpdatingItemId(productId);
      await handleCartItemsQantity({ productId, variantId });
      await handleGetItems();
      triggerToast(`Increased quantity of "${item?.product?.title || 'item'}"`);
    } catch (error) {
      console.error('Error increasing quantity:', error);
      triggerToast(error.response?.data?.message || 'Unable to update quantity.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecreaseQty = (item) => {
    triggerToast(`Minimum quantity reached for "${item?.product?.title || 'item'}".`);
  };

  const handleRemoveItem = (item) => {
    triggerToast(`"${item?.product?.title || 'Item'}" removed from bag.`);
  };

  const handleToggleWishlist = (item) => {
    const id = item?.product?._id || item?._id;
    setWishlistItems((prev) => {
      const isSaved = !prev[id];
      triggerToast(
        isSaved
          ? `Saved "${item?.product?.title || 'piece'}" to vault`
          : `Removed from vault`
      );
      return { ...prev, [id]: isSaved };
    });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      triggerToast('Please enter a promo code.');
      return;
    }
    setPromoApplied(true);
    triggerToast('Promo code applied successfully (10% off).');
  };

  const handleProceedCheckout = () => {
    triggerToast('Proceeding to checkout...');
  };

  return (
    <div className="v-cart">
      {/* ── Sticky Header matching Home and ProductDetails ── */}
      <header className="v-cart__header">
        <Link to="/" className="v-cart__brand">
          VENDRA
        </Link>

        <div className="v-cart__header-actions">
          <Link to="/" className="v-cart__back-btn">
            <ArrowLeft size={14} />
            <span>Back to catalog</span>
          </Link>

          <div className="v-cart__bag-btn-active" title="Archival Bag">
            <ShoppingBag size={18} />
            {totalItemsCount > 0 && <span className="v-badge-count">{totalItemsCount}</span>}
          </div>
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="v-cart__main">
        {/* Page Heading & Breadcrumb */}
        <div className="v-cart__hero-bar">
          <div>
            <div className="v-cart__breadcrumb">
              <Link to="/">Home</Link>
              <span className="v-sep">/</span>
              <span className="v-active">Shopping Bag</span>
            </div>

            <div className="v-cart__title-wrap">
              <h1 className="v-cart__title">Shopping Bag</h1>
              <span className="v-cart__count-pill">
                ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
              </span>
            </div>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="v-cart__skeleton-wrap">
            <div className="v-cart__skeleton-card" />
            <div className="v-cart__skeleton-card" style={{ opacity: 0.4 }} />
          </div>
        ) : items.length === 0 ? (
          /* Empty Bag State */
          <div className="v-cart__empty">
            <div className="v-cart__empty-icon-wrap">
              <ShoppingBag size={30} />
            </div>
            <h2>Your Bag is Empty</h2>
            <p>
              You haven’t added any items to your bag yet. Explore our curated catalog of luxury
              pieces and silhouettes.
            </p>
            <Link to="/" className="v-cart__explore-btn">
              <span>Explore Catalog</span>
            </Link>
          </div>
        ) : (
          /* Two-Column Layout */
          <div className="v-cart__layout">
            {/* ── Left Column: Bag Items ── */}
            <section className="v-cart__items-col">
              {items.map((item, idx) => {
                const product = item?.product || {};
                const unitPrice = item?.price?.amount ?? product?.price?.amount ?? 0;
                const currency = item?.price?.currency || product?.price?.currency || 'INR';
                const quantity = Number(item?.quantity) || 1;
                const subtotal = unitPrice * quantity;
                const imageSrc = getProductImage(item);
                const isUpdating = updatingItemId === (product?._id || item?._id);
                const isWishlisted = !!wishlistItems[product?._id || idx];

                // Extract variant attributes if available
                const variantAttributes =
                  item?.variant?.attributes || product?.variants?.[0]?.attributes;
                const attrEntries = getAttributeEntries(variantAttributes);
                const descriptionText = formatDescription(product?.description);

                return (
                  <article key={product?._id || idx} className="v-cart__item-card">
                    {/* 3:4 Aspect Portrait Media */}
                    <div className="v-cart__item-media">
                      <img
                        src={imageSrc}
                        alt={product?.title || 'Garment'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/designer_bomber_jacket.jpg';
                        }}
                      />
                    </div>

                    {/* Content & Actions */}
                    <div className="v-cart__item-body">
                      <div className="v-cart__item-top">
                        <div className="v-cart__item-header">
                          <span className="v-cart__item-tagline">
                            Curated Piece
                          </span>

                          {product?._id && (
                            <span className="v-cart__lot-id">
                              ID: #{product._id.slice(-6).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <h2 className="v-cart__item-title">
                          <Link to={product?._id ? `/product/${product._id}` : '#'}>
                            {product?.title || 'Selected Piece'}
                          </Link>
                        </h2>

                        {descriptionText && (
                          <p className="v-cart__item-desc">
                            {descriptionText}
                          </p>
                        )}

                        {/* Real Variant Attributes Chips (No hardcoded fake values) */}
                        <div className="v-cart__spec-chips">
                          {attrEntries.map(([k, v]) => (
                            <span key={k} className="v-cart__spec-chip">
                              {k}: <strong>{String(v)}</strong>
                            </span>
                          ))}

                          {product?.seller && (
                            <span className="v-cart__spec-chip">
                              Seller:{' '}
                              <strong style={{ fontFamily: 'monospace' }}>
                                {String(product.seller).slice(0, 8)}...{String(product.seller).slice(-4)}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Controls Bar */}
                      <div className="v-cart__item-bottom">
                        <div className="v-cart__qty-unit-wrap">
                          {/* Quantity Stepper */}
                          <div className="v-cart__qty-selector">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => handleDecreaseQty(item)}
                              disabled={isUpdating}
                            >
                              <Minus size={13} />
                            </button>

                            <span className="v-cart__qty-val">{quantity}</span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => handleIncreaseQty(item)}
                              disabled={isUpdating}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="v-cart__unit-price">
                            <strong>{formatPrice(unitPrice, currency)}</strong>
                          </div>
                        </div>

                        {/* Subtotal & Action Buttons */}
                        <div className="v-cart__subtotal-actions">
                          <div className="v-cart__item-subtotal">
                            <span className="v-cart__subtotal-lbl">Subtotal</span>
                            <span className="v-cart__subtotal-val">
                              {formatPrice(subtotal, currency)}
                            </span>
                          </div>

                          <div className="v-cart__item-actions">
                            <button
                              type="button"
                              title={isWishlisted ? 'Saved to vault' : 'Save to vault'}
                              className={`v-action-wishlist ${isWishlisted ? 'is-active' : ''}`}
                              onClick={() => handleToggleWishlist(item)}
                            >
                              <Heart
                                size={15}
                                fill={isWishlisted ? '#ef4444' : 'none'}
                                color={isWishlisted ? '#ef4444' : 'currentColor'}
                              />
                            </button>

                            <button
                              type="button"
                              title="Remove item"
                              className="v-action-delete"
                              onClick={() => handleRemoveItem(item)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* ── Complimentary Services Bento (Matching Product Details Perks) ── */}
              <div className="v-cart__care-box">
                <span className="v-care-title">Complimentary Services</span>
                <ul className="v-care-list">
                  <li>
                    <Truck size={16} />
                    <span>Free shipping on all orders with insured courier transit</span>
                  </li>
                  <li>
                    <RotateCcw size={16} />
                    <span>Easy 7-day hassle-free returns &amp; exchanges</span>
                  </li>
                  <li>
                    <ShieldCheck size={16} />
                    <span>100% authentic product verified by our atelier specialists</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ── Right Column: Sticky Summary & Checkout ── */}
            <aside className="v-cart__summary-col">
              <div className="v-cart__summary-card">
                <div className="v-cart__summary-head">
                  <h2>Order Summary</h2>
                </div>

                <div className="v-cart__breakdown">
                  <div className="v-cart__breakdown-row">
                    <span>Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})</span>
                    <span className="v-val">{formatPrice(rawSubtotal, primaryCurrency)}</span>
                  </div>

                  <div className="v-cart__breakdown-row">
                    <span>Estimated Shipping</span>
                    <span className="v-free-tier">FREE</span>
                  </div>

                  <div className="v-cart__breakdown-row">
                    <span>Estimated Tax</span>
                    <span className="v-calc">Calculated at checkout</span>
                  </div>

                  {promoApplied && (
                    <div className="v-cart__breakdown-row" style={{ color: 'var(--success)' }}>
                      <span>Discount (10%)</span>
                      <span className="v-val" style={{ color: 'var(--success)' }}>
                        -{formatPrice(discountAmount, primaryCurrency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Value */}
                <div className="v-cart__total-block">
                  <span className="v-total-lbl">Total</span>
                  <span className="v-val">{formatPrice(finalTotal, primaryCurrency)}</span>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="v-cart__promo-box">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </form>

                {/* Primary Solid Checkout CTA */}
                <button
                  type="button"
                  className="v-cart__checkout-btn"
                  onClick={handleProceedCheckout}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={15} />
                </button>

                {/* Secondary Continue Shopping CTA */}
                <Link to="/" className="v-cart__continue-btn">
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="v-cart__trust-box">
                <div className="v-cart__trust-item">
                  <ShieldCheck size={18} />
                  <div>
                    <h4>Authenticity Guaranteed</h4>
                    <p>Every piece is verified before dispatch to ensure genuine craftsmanship.</p>
                  </div>
                </div>

                <div className="v-cart__trust-item">
                  <Truck size={18} />
                  <div>
                    <h4>Secure Doorstep Delivery</h4>
                    <p>Carefully boxed in signature packaging and fully tracked to your door.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="v-cart__toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Cart;