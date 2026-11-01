import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Check, PackageOpen, Search } from 'lucide-react';
import ProductImage from '../../../components/product/ProductImage';
import { Stagger } from '../../../components/ui/Reveal';
import { fadeUp } from '../../../components/ui/motion';
import { formatPrice } from '../../../utils/product';
import { normalize } from '../../search/searchProducts';
import { formatOrderDate } from '../../../utils/formatDate';
import { getMyOrders } from '../services/orders.api';
import '../../../styles/orders.scss';

const MAX_THUMBS = 4;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [query, setQuery] = useState('');

  const fetchOrders = useCallback(() => {
    getMyOrders()
      .then((list) => {
        setOrders(list);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const retry = () => {
    setStatus('loading');
    fetchOrders();
  };

  const visible = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        normalize(o.orderId).includes(q) ||
        o.items.some((i) => normalize(i.title).includes(q))
    );
  }, [orders, query]);

  return (
    <div className="container orders">
      <header className="orders__head">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>My orders</h1>
        </div>
        {status === 'ready' && orders.length > 0 && (
          <label className="orders__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by product or order ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search your orders"
            />
          </label>
        )}
      </header>

      {status === 'loading' && (
        <div className="orders__list" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 210 }} />)}
        </div>
      )}

      {status === 'error' && (
        <div className="empty">
          <div className="empty__icon"><AlertCircle size={26} /></div>
          <h2>We couldn’t load your orders</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className="btn--solid" onClick={retry}><span>Try again</span></button>
        </div>
      )}

      {status === 'ready' && orders.length === 0 && (
        <div className="empty">
          <div className="empty__icon"><PackageOpen size={26} /></div>
          <h2>No orders yet</h2>
          <p>When you place an order it will show up here.</p>
          <Link to="/search" className="btn--solid"><span>Start shopping</span></Link>
        </div>
      )}

      {status === 'ready' && orders.length > 0 && visible.length === 0 && (
        <div className="empty">
          <h3>No orders match “{query}”</h3>
          <button type="button" className="btn--outline" onClick={() => setQuery('')}>Clear search</button>
        </div>
      )}

      {status === 'ready' && visible.length > 0 && (
        <Stagger key={query} className="orders__list" gap={0.07}>
          {visible.map((order) => {
            const count = order.items.reduce((n, i) => n + (Number(i.quantity) || 1), 0);
            const extra = order.items.length - MAX_THUMBS;
            const to = `/orders/${encodeURIComponent(order.orderId || order.id)}`;
            return (
              <motion.article key={order.id} className="order-card" variants={fadeUp}>
                <div className="order-card__top">
                  <dl>
                    <div><dt>Placed on</dt><dd>{formatOrderDate(order.createdAt)}</dd></div>
                    <div><dt>Total</dt><dd>{formatPrice({ amount: order.amount, currency: order.currency })}</dd></div>
                    <div><dt>Items</dt><dd>{count}</dd></div>
                    <div className="order-card__id"><dt>Order ID</dt><dd title={order.orderId}>{order.orderId}</dd></div>
                  </dl>
                  <span className="order-badge order-badge--paid"><Check size={12} /> Paid</span>
                </div>

                <div className="order-card__items">
                  <ul>
                    {order.items.slice(0, MAX_THUMBS).map((item, i) => (
                      <li key={`${item.productId}-${i}`}>
                        <Link to={item.productId ? `/product/${item.productId}` : to} className="order-card__thumb" title={item.title}>
                          <ProductImage src={item.image} alt={item.title} />
                        </Link>
                      </li>
                    ))}
                    {extra > 0 && <li className="order-card__more">+{extra}</li>}
                  </ul>
                  <p>
                    {order.items.slice(0, 2).map((i) => i.title).join(', ')}
                    {order.items.length > 2 ? ` and ${order.items.length - 2} more` : ''}
                  </p>
                </div>

                <Link to={to} className="link-arrow order-card__cta">
                  View details &amp; status <ArrowRight size={14} />
                </Link>
              </motion.article>
            );
          })}
        </Stagger>
      )}
    </div>
  );
};

export default MyOrders;
