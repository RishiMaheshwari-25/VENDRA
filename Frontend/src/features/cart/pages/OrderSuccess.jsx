import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import {
  Check,
  Copy,
  Printer,
  ShoppingBag,
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
  FALLBACK_IMAGE,
  formatDateTime,
  formatMoney,
  formatShortDate,
  loadOrderSnapshot,
  normalizeOrder,
} from '../utils/orderSnapshot';
import '../../../styles/order-success.scss';

// Estimated delivery window, in days after payment. Adjust to match your logistics.
const DELIVERY_WINDOW_DAYS = [5, 7];

const NEXT_STEPS = [
  { icon: PackageCheck, title: 'We prepare your order', text: 'Each piece is quality-checked and carefully packed in signature packaging.' },
  { icon: Truck, title: 'It ships to you', text: 'Your parcel is dispatched with insured courier transit.' },
  { icon: ShieldCheck, title: 'You enjoy it', text: 'Not quite right? Returns and exchanges are accepted within 7 days.' },
];

const POLICIES = [
  { icon: Truck, text: 'Free shipping on all orders with insured courier transit' },
  { icon: RotateCcw, text: 'Easy 7-day hassle-free returns & exchanges' },
  { icon: ShieldCheck, text: '100% authentic product verified by our atelier specialists' },
];

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
      let order = null;
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

  const delivery = useMemo(() => {
    const base = order?.paidAt ? new Date(order.paidAt) : null;
    if (!base || Number.isNaN(base.getTime())) return null;
    const [from, to] = DELIVERY_WINDOW_DAYS.map((days) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d;
    });
    return `${formatShortDate(from)} – ${formatShortDate(to)}`;
  }, [order]);

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
  const tracker = [
    { label: 'Order placed', done: confirmed },
    { label: 'Payment confirmed', done: confirmed },
    { label: 'Packed', done: false },
    { label: 'Shipped', done: false },
    { label: 'Delivered', done: false },
  ];

  return (
    <div className="v-success">
      <header className="v-success__header">
        <Link to="/" className="v-success__brand">VENDRA</Link>
        <Link to="/" className="v-success__header-link">
          <ShoppingBag size={14} />
          <span>Continue shopping</span>
        </Link>
      </header>

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

            {/* ── Progress ── */}
            <section className="v-success__card v-success__progress" aria-label="Order progress">
              <div className="v-success__card-head">
                <h2>Order progress</h2>
                {delivery && (
                  <span className="v-success__eta"><Truck size={14} /> Estimated delivery <strong>{delivery}</strong></span>
                )}
              </div>
              <ol className="v-tracker">
                {tracker.map((step) => (
                  <li key={step.label} className={step.done ? 'is-done' : ''}>
                    <span className="v-tracker__dot">{step.done && <Check size={12} strokeWidth={3} />}</span>
                    <span className="v-tracker__label">{step.label}</span>
                  </li>
                ))}
              </ol>
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
                        <img
                          src={it.image}
                          alt={it.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
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
              <Link to="/" className="v-btn v-btn--solid">
                <span>Continue shopping</span> <ArrowRight size={14} />
              </Link>
              <button type="button" className="v-btn v-btn--outline" onClick={() => window.print()}>
                <Printer size={14} /> <span>Print receipt</span>
              </button>
            </div>

            <ul className="v-success__policies">
              {POLICIES.map(({ icon: Icon, text }) => (
                <li key={text}><Icon size={16} /> <span>{text}</span></li>
              ))}
            </ul>
          </>
        )}
      </main>

      <footer className="v-success__footer">
        <span className="v-success__footer-brand">VENDRA</span>
        <span className="v-success__muted">Need help? Quote your order ID when contacting support.</span>
      </footer>

      <div className="v-success__toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>
    </div>
  );
};

export default OrderSuccess;
