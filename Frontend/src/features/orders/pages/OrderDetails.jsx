import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion } from 'motion/react';
import { Check, Copy, CreditCard, Printer, ShoppingBag } from 'lucide-react';
import ProductImage from '../../../components/product/ProductImage';
import { useToast } from '../../../components/ui/toastContext';
import { formatPrice, getAttributeEntries } from '../../../utils/product';
import { getOrder } from '../services/orders.api';
import { formatOrderDate } from '../../../utils/formatDate';
import '../../../styles/orders.scss';

const formatDateTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
};

const OrderDetailsInner = ({ orderId }) => {
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing | error

  useEffect(() => {
    let current = true;
    getOrder(orderId)
      .then((data) => {
        if (!current) return;
        setOrder(data);
        setStatus('ready');
      })
      .catch((err) => current && setStatus(err?.response?.status === 404 ? 'missing' : 'error'));
    return () => {
      current = false;
    };
  }, [orderId]);

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied`);
    } catch {
      toast('Copy is not available in this browser', 'error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container orders">
        <div className="skeleton" style={{ height: 60, width: 320, marginBottom: 28 }} />
        <div className="od__layout">
          <div className="skeleton" style={{ height: 380 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  if (status !== 'ready') {
    return (
      <div className="container">
        <div className="empty" style={{ minHeight: '50vh', justifyContent: 'center' }}>
          <h2>{status === 'missing' ? 'Order not found' : 'We couldn’t load this order'}</h2>
          <p>{status === 'missing' ? 'This order doesn’t exist on your account.' : 'Please try again in a moment.'}</p>
          <Link to="/orders" className="btn--solid"><span>Back to my orders</span></Link>
        </div>
      </div>
    );
  }

  const count = order.items.reduce((n, i) => n + (Number(i.quantity) || 1), 0);
  const total = formatPrice({ amount: order.amount, currency: order.currency });

  // Only states the backend actually records.
  const steps = [
    { label: 'Order placed', at: order.createdAt, done: true },
    { label: 'Payment confirmed', at: order.paidAt, done: order.status === 'paid' },
  ];

  return (
    <div className="container orders od">
      <Link to="/orders" className="back-link">← All orders</Link>

      <header className="orders__head od__head">
        <div>
          <span className="eyebrow">Order</span>
          <h1>Order details</h1>
          <button type="button" className="od__id" onClick={() => copy(order.orderId, 'Order ID')} title="Copy order ID">
            {order.orderId} <Copy size={13} />
          </button>
        </div>
        <span className="order-badge order-badge--paid"><Check size={12} /> Paid</span>
      </header>

      <div className="od__layout">
        <div className="od__main">
          {/* Status timeline */}
          <section className="od__card" aria-label="Order status">
            <h2>Order status</h2>
            <ol className="od__timeline">
              {steps.map((step, i) => (
                <motion.li
                  key={step.label}
                  className={step.done ? 'is-done' : ''}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.15, duration: 0.5 }}
                >
                  <span className="od__dot">{step.done && <Check size={12} strokeWidth={3} />}</span>
                  <div>
                    <strong>{step.label}</strong>
                    {formatDateTime(step.at) && <small>{formatDateTime(step.at)}</small>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* Items */}
          <section className="od__card" aria-label="Items in this order">
            <h2>{count} {count === 1 ? 'item' : 'items'}</h2>
            <ul className="od__items">
              {order.items.map((item, i) => {
                const attrs = getAttributeEntries(item.attributes);
                const link = item.productId ? `/product/${item.productId}` : null;
                return (
                  <li key={`${item.variantId}-${i}`}>
                    <Link to={link || '#'} className="od__thumb">
                      <ProductImage src={item.image} alt={item.title} />
                    </Link>
                    <div className="od__item-body">
                      <h3>{link ? <Link to={link}>{item.title}</Link> : item.title}</h3>
                      {attrs.length > 0 && (
                        <ul className="od__chips">
                          {attrs.map(([k, v]) => <li key={k}>{k}: <b>{String(v)}</b></li>)}
                        </ul>
                      )}
                      <span className="od__qty">
                        Qty {item.quantity} × {formatPrice({ amount: item.unitPrice, currency: item.currency })}
                      </span>
                      {link && <Link to={link} className="link-arrow od__again">Buy again</Link>}
                    </div>
                    <strong className="od__line">
                      {formatPrice({ amount: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1), currency: item.currency })}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="od__side">
          <section className="od__card" aria-label="Payment summary">
            <h2>Payment</h2>
            <dl className="od__facts">
              <div><dt>Order date</dt><dd>{formatOrderDate(order.createdAt)}</dd></div>
              <div><dt>Total paid</dt><dd className="od__total">{total}</dd></div>
              {order.paymentId && (
                <div>
                  <dt>Payment ID</dt>
                  <dd>
                    <button type="button" className="od__id od__id--small" onClick={() => copy(order.paymentId, 'Payment ID')}>
                      {order.paymentId} <Copy size={12} />
                    </button>
                  </dd>
                </div>
              )}
            </dl>
            <p className="od__method"><CreditCard size={14} /> Paid securely via Razorpay</p>
          </section>

          <div className="od__actions">
            <button type="button" className="btn--outline" onClick={() => window.print()}>
              <Printer size={15} /> <span>Print receipt</span>
            </button>
            <Link to="/search" className="btn--solid"><ShoppingBag size={15} /> <span>Keep shopping</span></Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

const OrderDetails = () => {
  const { orderId } = useParams();
  return <OrderDetailsInner key={orderId} orderId={orderId} />;
};

export default OrderDetails;
