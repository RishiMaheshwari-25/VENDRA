import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import {
  Check,
  Copy,
  Printer,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageCheck,
  CreditCard,
  Mail,
  Phone,
  User,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import {
  formatDateTime,
  formatMoney,
  loadOrderSnapshot,
  normalizeOrder,
} from '../utils/orderSnapshot';
import ProductImage from '../../../components/product/ProductImage';
import { PROMISES } from '../../../config/storefront';
import '../../../styles/order-success.scss';

const NEXT_STEPS = [
  { icon: PackageCheck, title: 'We prepare your order', text: 'Your items are checked and packed by the seller.' },
  { icon: Truck, title: 'It ships to you', text: 'Your parcel is handed to the courier and sent to you.' },
  { icon: ShieldCheck, title: 'You enjoy it', text: 'Not quite right? Check our returns promise below.' },
];

const POLICY_ICONS = { shipping: Truck, returns: RotateCcw, payment: ShieldCheck };

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('order_id');
  const user = useSelector((state) => state.auth?.user);
  const { handleGetOrder } = useCart();

  const [state, setState] = useState({ loading: true, order: null });
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!orderId) {
        if (active) setState({ loading: false, order: null });
        return;
      }
      // Prefer server data (authoritative); fall back to the snapshot saved at checkout.
      let order;
      try {
        const remote = await handleGetOrder(orderId);
        order = normalizeOrder(remote, 'server');
      } catch {
        order = null;
      }
      if (!order) order = normalizeOrder(loadOrderSnapshot(orderId), 'snapshot');
      if (active) setState({ loading: false, order });
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId, handleGetOrder]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const { loading, order } = state;
  const confirmed = Boolean(order?.paid);

  const totalItems = useMemo(
    () => (order?.items || []).reduce((sum, it) => sum + it.quantity, 0),
    [order]
  );

  const firstName = (user?.fullname || '').trim().split(/\s+/)[0];

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`${label} copied`);
    } catch {
      setToast('Copy is not available in this browser');
    }
  };

  const paidOn = formatDateTime(order?.paidAt);
  return (
    <div className="v-success">
      <main className="v-success__main">
        {loading ? (
          <div className="v-success__skeleton" aria-busy="true" aria-label="Loading your order">
            <div /> <div /> <div />
          </div>
        ) : !confirmed ? (
          <section className="v-success__notice">
            <div className="v-success__notice-icon"><AlertCircle size={28} /></div>
            <h1>We couldn’t confirm this order</h1>
            <p>
              {orderId
                ? 'We were unable to find a verified payment for this order on this device. If you were charged, your order is safe — please contact support with your order ID.'
                : 'This page needs an order reference. Head back to your bag to continue.'}
            </p>
            {orderId && (
              <button type="button" className="v-success__id-chip" onClick={() => copy(orderId, 'Order ID')}>
                {orderId} <Copy size={13} />
              </button>
            )}
            <div className="v-success__actions">
              <Link to="/cart" className="v-btn v-btn--solid">View bag</Link>
              <Link to="/" className="v-btn v-btn--outline">Continue shopping</Link>
            </div>
          </section>
        ) : (
          <>
            {/* ── Hero ── */}
            <section className="v-success__hero">
              <div className="v-success__confetti" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
              </div>
              <div className="v-success__check" aria-hidden="true"><Check size={34} strokeWidth={2.4} /></div>
              <span className="v-success__eyebrow">Order confirmed</span>
              <h1 className="v-success__title">
                {firstName ? `Thank you, ${firstName}.` : 'Thank you for your order.'}
              </h1>
              <p className="v-success__lead">
                Your payment was received and your order is placed.
                {user?.email && <> Order placed under <strong>{user.email}</strong>.</>}
              </p>
            </section>

            {/* ── Key facts ── */}
            <section className="v-success__facts" aria-label="Order details">
              <div className="v-fact">
                <span className="v-fact__k">Order ID</span>
                <span className="v-fact__v v-mono">
                  {order.orderId}
                  <button type="button" aria-label="Copy order ID" onClick={() => copy(order.orderId, 'Order ID')}>
                    <Copy size={13} />
                  </button>
                </span>
              </div>
              {order.paymentId && (
                <div className="v-fact">
                  <span className="v-fact__k">Payment ID</span>
                  <span className="v-fact__v v-mono">
                    {order.paymentId}
                    <button type="button" aria-label="Copy payment ID" onClick={() => copy(order.paymentId, 'Payment ID')}>
                      <Copy size={13} />
                    </button>
                  </span>
                </div>
              )}
              {paidOn && (
                <div className="v-fact">
                  <span className="v-fact__k">Date</span>
                  <span className="v-fact__v">{paidOn}</span>
                </div>
              )}
              <div className="v-fact">
                <span className="v-fact__k">Amount paid</span>
                <span className="v-fact__v">{formatMoney(order.total, order.currency)}</span>
              </div>
              <div className="v-fact">
                <span className="v-fact__k">Payment status</span>
                <span className="v-fact__v"><span className="v-badge-paid"><Check size={11} /> Paid</span></span>
              </div>
            </section>

            <div className="v-success__layout">
              {/* ── Items ── */}
              <section className="v-success__card" aria-label="Items ordered">
                <div className="v-success__card-head">
                  <h2>Items ordered</h2>
                  <span className="v-success__muted">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                </div>
                <ul className="v-items">
                  {order.items.map((it, idx) => (
                    <li key={`${it.productId || 'item'}-${idx}`} className="v-item">
                      <div className="v-item__media">
                        <ProductImage src={it.image} alt={it.title} />
                      </div>
                      <div className="v-item__body">
                        <h3>
                          {it.productId ? <Link to={`/product/${it.productId}`}>{it.title}</Link> : it.title}
                        </h3>
                        {Object.keys(it.attributes).length > 0 && (
                          <div className="v-item__chips">
                            {Object.entries(it.attributes).map(([k, v]) => (
                              <span key={k}>{k}: <strong>{String(v)}</strong></span>
                            ))}
                          </div>
                        )}
                        <span className="v-success__muted">
                          Qty {it.quantity} × {formatMoney(it.unitPrice, it.currency)}
                        </span>
                      </div>
                      <div className="v-item__price">{formatMoney(it.unitPrice * it.quantity, it.currency)}</div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ── Sidebar ── */}
              <aside className="v-success__side">
                <section className="v-success__card" aria-label="Payment summary">
                  <div className="v-success__card-head"><h2>Payment summary</h2></div>
                  <dl className="v-summary">
                    <div><dt>Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
                    <div><dt>Shipping</dt><dd className="v-free">Free</dd></div>
                    <div className="v-summary__total">
                      <dt>Total paid</dt><dd>{formatMoney(order.total, order.currency)}</dd>
                    </div>
                  </dl>
                  <p className="v-success__muted v-summary__note">
                    <CreditCard size={13} /> Paid securely via Razorpay
                  </p>
                </section>

                {(user?.fullname || user?.email || user?.contact) && (
                  <section className="v-success__card" aria-label="Customer details">
                    <div className="v-success__card-head"><h2>Customer</h2></div>
                    <ul className="v-contact">
                      {user?.fullname && <li><User size={14} /> {user.fullname}</li>}
                      {user?.email && <li><Mail size={14} /> {user.email}</li>}
                      {user?.contact && <li><Phone size={14} /> {user.contact}</li>}
                    </ul>
                  </section>
                )}
              </aside>
            </div>

            {/* ── What's next ── */}
            <section className="v-success__next" aria-label="What happens next">
              <h2>What happens next</h2>
              <div className="v-success__next-grid">
                {NEXT_STEPS.map(({ icon: Icon, title, text }, i) => (
                  <div key={title} className="v-next">
                    <span className="v-next__num">{String(i + 1).padStart(2, '0')}</span>
                    <Icon size={20} />
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="v-success__actions">
              <Link to={`/orders/${encodeURIComponent(order.orderId)}`} className="v-btn v-btn--solid">
                <span>View order</span> <ArrowRight size={14} />
              </Link>
              <Link to="/orders" className="v-btn v-btn--outline">My orders</Link>
              <Link to="/" className="v-btn v-btn--outline">Continue shopping</Link>
              <button type="button" className="v-btn v-btn--outline" onClick={() => window.print()}>
                <Printer size={14} /> <span>Print receipt</span>
              </button>
            </div>

            <ul className="v-success__policies">
              {PROMISES.map((p) => {
                const Icon = POLICY_ICONS[p.key] || ShieldCheck;
                return <li key={p.key}><Icon size={16} /> <span>{p.long}</span></li>;
              })}
            </ul>
          </>
        )}
      </main>

      <div className="v-success__toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>
    </div>
  );
};

export default OrderSuccess;
