import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../utils/selectors';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useRazorpay } from 'react-razorpay';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { buildOrderItems, markOrderVerified, saveOrderSnapshot } from '../utils/orderSnapshot';
import ProductImage from '../../../components/product/ProductImage';
import { useToast } from '../../../components/ui/toastContext';
import { PROMISES } from '../../../config/storefront';
import { formatPrice as formatMoney, getAttributeEntries, imageUrls } from '../../../utils/product';
import '../../../styles/cart.scss';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const PERK_ICONS = { shipping: Truck, returns: RotateCcw, payment: ShieldCheck };

const money = (amount, currency) => {
  const code = Array.isArray(currency) ? currency[0] : currency;
  return formatMoney({ amount, currency: code || 'INR' });
};

const getVariantId = (item) =>
  item?.variant?._id ||
  (typeof item?.variant === 'string' ? item.variant : null) ||
  item?.product?.variants?.[0]?._id;

const getProductId = (item) => item?.product?._id || item?._id;

const getCartItemId = (item) => `${getProductId(item) || 'item'}-${getVariantId(item) || 'variant'}`;

// Price the shopper would pay today (variant price first, then product price).
const getCurrentPrice = (item) => {
  const product = item?.product;
  const variantId = getVariantId(item);
  const matched = Array.isArray(product?.variants)
    ? product.variants.find((v) => variantId && String(v?._id) === String(variantId))
    : product?.variants;
  const variantPrice = item?.variant?.price || matched?.price;
  const price = variantPrice || product?.price;
  if (price && price.amount !== undefined && price.amount !== null && Number.isFinite(Number(price.amount))) {
    return { price, isVariantPrice: Boolean(variantPrice) };
  }
  return null;
};

const getItemImage = (item) => {
  const variantImgs = imageUrls(item?.variant?.images);
  const matched = Array.isArray(item?.product?.variants) ? item.product.variants[0] : item?.product?.variants;
  return variantImgs[0] || imageUrls(item?.product?.images)[0] || imageUrls(matched?.images)[0] || imageUrls(item?.images)[0] || null;
};

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const rawSubtotal = useSelector((state) => state.cart.totalPrice);
  const primaryCurrency = useSelector((state) => state.cart.currency);
  const user = useSelector((state) => state.auth?.user);
  const catalogue = useSelector(selectProducts);
  const { handleGetItems, handleCartItemsQantity, handleCartItemsDecrement, handleCreateCartOrder, handleVerifyCartOrder } = useCart();
  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let mounted = true;
    handleGetItems()
      .catch((err) => console.error('Failed to fetch cart items:', err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [handleGetItems]);

  const items = useMemo(() => (Array.isArray(cartItems) ? cartItems : []), [cartItems]);
  const totalCount = useMemo(() => items.reduce((n, it) => n + (Number(it?.quantity) || 1), 0), [items]);
  const suggestions = useMemo(
    () => [...catalogue].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3),
    [catalogue]
  );

  const changeQty = async (item, direction) => {
    const productId = getProductId(item);
    const variantId = getVariantId(item);
    if (!productId || !variantId) return toast('Unable to identify this item.', 'error');
    setUpdating(getCartItemId(item));
    try {
      await (direction > 0 ? handleCartItemsQantity : handleCartItemsDecrement)({ productId, variantId });
      await handleGetItems();
    } catch (error) {
      toast(error?.response?.data?.message || 'Unable to update quantity.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (!RAZORPAY_KEY) {
      toast('Payments are not configured. Set VITE_RAZORPAY_KEY_ID.', 'error');
      return;
    }
    setPaying(true);
    let order;
    try {
      order = await handleCreateCartOrder();
    } catch (error) {
      setPaying(false);
      toast(error?.response?.data?.message || 'Unable to start checkout.', 'error');
      return;
    }

    saveOrderSnapshot(order.id, { items: buildOrderItems(items), order });
    const instance = new Razorpay({
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'VENDRA',
      description: 'Order Payment',
      order_id: order.id,
      handler: async (response) => {
        try {
          const isValid = await handleVerifyCartOrder(response);
          if (isValid) {
            markOrderVerified(response.razorpay_order_id, response.razorpay_payment_id);
            navigate(`/order-success?order_id=${response?.razorpay_order_id}`);
          }
        } catch (error) {
          toast(error?.response?.data?.message || 'Payment could not be verified.', 'error');
        } finally {
          setPaying(false);
        }
      },
      modal: { ondismiss: () => setPaying(false) },
      prefill: { name: user?.fullname || '', email: user?.email || '', contact: user?.contact || '' },
      theme: { color: '#B5532F' },
    });
    instance.open();
  };

  return (
    <div className="container cart">
      <header className="cart__head">
        <span className="eyebrow">Your bag</span>
        <h1>
          Shopping bag <small>{!loading && `(${totalCount} ${totalCount === 1 ? 'item' : 'items'})`}</small>
        </h1>
      </header>

      {loading ? (
        <div className="cart__layout">
          <div className="cart__list">
            {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 168 }} />)}
          </div>
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div className="empty__icon"><ShoppingBag size={26} /></div>
          <h2>Your bag is empty</h2>
          <p>Add something you love and it will show up here.</p>
          <Link to="/search" className="btn--solid"><span>Start shopping</span></Link>
          {suggestions.length > 0 && (
            <ul className="cart__suggest">
              {suggestions.map((p) => (
                <li key={p._id}>
                  <Link to={`/product/${p._id}`}>
                    <span><ProductImage src={imageUrls(p.images)[0]} alt="" /></span>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="cart__layout">
          <ul className="cart__list">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const product = item?.product || {};
                const details = getCurrentPrice(item);
                const unit = Number(details?.price?.amount ?? item?.price?.amount ?? 0);
                const currency = details?.price?.currency || item?.price?.currency || 'INR';
                const original = Number(item?.price?.amount);
                const comparable =
                  details !== null && !details.isVariantPrice && Number.isFinite(original) && (item?.price?.currency || currency) === currency;
                const diff = comparable ? unit - original : 0;
                const qty = Number(item?.quantity) || 1;
                const id = getCartItemId(item);
                const busy = updating === id;
                const attrs = getAttributeEntries(item?.variant?.attributes || (Array.isArray(product.variants) ? product.variants[0]?.attributes : product.variants?.attributes));

                return (
                  <motion.li
                    key={id}
                    layout
                    className="cart__item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={product._id ? `/product/${product._id}` : '#'} className="cart__media">
                      <ProductImage src={getItemImage(item)} alt={product.title || ''} />
                    </Link>

                    <div className="cart__body">
                      <div className="cart__row">
                        <h2><Link to={product._id ? `/product/${product._id}` : '#'}>{product.title || 'Selected item'}</Link></h2>
                        <strong className="cart__line">{money(unit * qty, currency)}</strong>
                      </div>

                      {attrs.length > 0 && (
                        <ul className="cart__chips">
                          {attrs.map(([k, v]) => <li key={k}>{k}: <b>{String(v)}</b></li>)}
                        </ul>
                      )}

                      <div className="cart__row cart__row--end">
                        <div className="cart__qty" role="group" aria-label="Quantity">
                          <button type="button" onClick={() => changeQty(item, -1)} disabled={busy || qty <= 1} aria-label="Decrease quantity"><Minus size={14} /></button>
                          <motion.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>{qty}</motion.span>
                          <button type="button" onClick={() => changeQty(item, 1)} disabled={busy} aria-label="Increase quantity"><Plus size={14} /></button>
                        </div>
                        <span className="cart__unit">{money(unit, currency)} each</span>
                      </div>

                      {comparable && diff !== 0 && (
                        <p className={`cart__note ${diff < 0 ? 'is-down' : 'is-up'}`}>
                          {diff < 0
                            ? `Price dropped by ${money(Math.abs(diff), currency)} since you added it.`
                            : `Price rose by ${money(diff, currency)} since you added it.`}
                        </p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <aside className="cart__summary">
            <h2>Order summary</h2>
            <dl>
              <div><dt>Subtotal ({totalCount} {totalCount === 1 ? 'item' : 'items'})</dt><dd>{money(rawSubtotal, primaryCurrency)}</dd></div>
              <div><dt>Shipping</dt><dd className="cart__free">Free</dd></div>
            </dl>
            <div className="cart__total">
              <span>Total</span>
              <motion.strong key={rawSubtotal} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{money(rawSubtotal, primaryCurrency)}</motion.strong>
            </div>

            <button type="button" className="btn--solid cart__checkout" onClick={handleCheckout} disabled={paying}>
              {paying ? <span className="spinner" /> : <><span>Checkout</span> <ArrowRight size={15} /></>}
            </button>
            <Link to="/search" className="cart__continue">Continue shopping</Link>

            <ul className="cart__perks">
              {PROMISES.map((p) => {
                const Icon = PERK_ICONS[p.key] || ShieldCheck;
                return <li key={p.key}><Icon size={15} /><span>{p.long}</span></li>;
              })}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
