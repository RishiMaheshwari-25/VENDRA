import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSellerProducts } from '../../../utils/selectors';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Boxes, Grid2x2, Layers, List, Package, Plus, Search, Trash2, Wallet } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import ProductImage from '../../../components/product/ProductImage';
import { Stagger } from '../../../components/ui/Reveal';
import { fadeUp } from '../../../components/ui/motion';
import { searchProducts } from '../../search/searchProducts';
import { formatPrice, productGallery, stockStatus, totalStock } from '../../../utils/product';
import { useToast } from '../../../components/ui/toastContext';
import '../../../styles/seller.scss';

const SORTS = {
  newest: { label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  oldest: { label: 'Oldest', fn: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0) },
  title: { label: 'Title A–Z', fn: (a, b) => (a.title || '').localeCompare(b.title || '') },
  stock: { label: 'Lowest stock', fn: (a, b) => totalStock(a) - totalStock(b) },
};

const STOCK_LABEL = { none: 'No variants', out: 'Sold out', low: 'Low stock', in: 'In stock' };

const Dashboard = () => {
  const { handleGetSellerProduct, handleDeleteProduct } = useProduct();
  const toast = useToast();
  const products = useSelector(selectSellerProducts);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    handleGetSellerProduct().finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every number here is derived from the seller's real products and variants.
  const stats = useMemo(() => {
    const variants = products.reduce((n, p) => n + (p.variants?.length || 0), 0);
    const units = products.reduce((n, p) => n + totalStock(p), 0);
    const value = {};
    products.forEach((p) =>
      (p.variants || []).forEach((v) => {
        const price = v.price || p.price;
        const cur = price?.currency || 'INR';
        value[cur] = (value[cur] || 0) + (Number(price?.amount) || 0) * (Number(v.stock) || 0);
      })
    );
    return { variants, units, value };
  }, [products]);

  const list = useMemo(() => {
    const base = query.trim() ? searchProducts(products, query) : products;
    return query.trim() ? base : [...base].sort(SORTS[sort].fn);
  }, [products, query, sort]);

  const valueText = Object.keys(stats.value).length
    ? Object.entries(stats.value).map(([currency, amount]) => formatPrice({ amount, currency })).join(' · ')
    : '—';

  const onDeleteProduct = async (product) => {
    if (deletingProductId) return;
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;

    setDeletingProductId(product._id);
    try {
      const result = await handleDeleteProduct(product._id);
      toast(result?.message || 'Product deleted successfully');
    } catch (error) {
      toast(error?.response?.data?.message || 'Could not delete the product. Please try again.', 'error');
    } finally {
      setDeletingProductId(null);
    }
  };

  const cards = [
    { icon: Package, label: 'Products', value: products.length },
    { icon: Layers, label: 'Variants', value: stats.variants },
    { icon: Boxes, label: 'Units in stock', value: stats.units },
    { icon: Wallet, label: 'Inventory value', value: valueText, small: true },
  ];

  return (
    <div className="container sd">
      <header className="sd__head">
        <div>
          <span className="eyebrow">Seller dashboard</span>
          <h1>Your products</h1>
        </div>
        <Link to="/seller/create-product" className="btn--solid"><Plus size={16} /> <span>Add product</span></Link>
      </header>

      <Stagger className="sd__stats" gap={0.08}>
        {cards.map(({ icon: Icon, label, value, small }) => (
          <motion.div key={label} className="sd__stat" variants={fadeUp}>
            <Icon size={18} />
            <span>{label}</span>
            <strong className={small ? 'is-small' : ''}>{ready ? value : '…'}</strong>
          </motion.div>
        ))}
      </Stagger>

      <div className="sd__tools">
        <label className="sd__search">
          <Search size={16} />
          <input type="search" placeholder="Search your products" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search your products" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={!!query.trim()} aria-label="Sort products">
          {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
        </select>
        <div className="sd__view" role="group" aria-label="View">
          <button type="button" className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><Grid2x2 size={16} /></button>
          <button type="button" className={view === 'table' ? 'is-on' : ''} onClick={() => setView('table')} aria-label="Table view" aria-pressed={view === 'table'}><List size={16} /></button>
        </div>
      </div>

      {!ready ? (
        <div className="pgrid pgrid--4 pgrid--skeleton">{Array.from({ length: 4 }).map((_, i) => <div key={i} />)}</div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty__icon"><Package size={26} /></div>
          <h2>No products yet</h2>
          <p>Create your first product, then add variants such as size and colour with their own stock.</p>
          <Link to="/seller/create-product" className="btn--solid"><span>Create your first product</span></Link>
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>No products match “{query}”</h3>
          <button type="button" className="btn--outline" onClick={() => setQuery('')}>Clear search</button>
        </div>
      ) : view === 'grid' ? (
        <Stagger key={`${sort}-${query}`} className="sd__grid" gap={0.05}>
          {list.map((p) => {
            const status = stockStatus(p);
            return (
              <motion.article key={p._id} className="sd__card" variants={fadeUp}>
                <Link to={`/seller/product/${p._id}`} className="sd__media">
                  <ProductImage src={productGallery(p)[0]} alt={p.title} />
                  <span className={`sd__tag sd__tag--${status}`}>{STOCK_LABEL[status]}</span>
                </Link>
                <div className="sd__info">
                  <h3>{p.title}</h3>
                  <span>{formatPrice(p.price)}</span>
                </div>
                <p className="sd__meta">{p.variants?.length || 0} variants · {totalStock(p)} in stock</p>
                <div className="sd__actions">
                  <Link to={`/seller/product/${p._id}`} className="btn--outline">Manage</Link>
                  <Link to={`/product/${p._id}`} className="link-arrow">View in shop</Link>
                  <button
                    type="button"
                    className="sd__delete"
                    onClick={() => onDeleteProduct(p)}
                    disabled={Boolean(deletingProductId)}
                    aria-label={`Delete ${p.title}`}
                    title="Delete product"
                  >
                    {deletingProductId === p._id ? <span className="spinner" /> : <Trash2 size={17} />}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </Stagger>
      ) : (
        <div className="sd__table-wrap">
          <table className="sd__table">
            <thead>
              <tr><th>Product</th><th>Price</th><th>Variants</th><th>Stock</th><th>Listed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const status = stockStatus(p);
                return (
                  <tr key={p._id}>
                    <td>
                      <Link to={`/seller/product/${p._id}`} className="sd__cell">
                        <span><ProductImage src={productGallery(p)[0]} alt="" /></span>
                        {p.title}
                      </Link>
                    </td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.variants?.length || 0}</td>
                    <td><span className={`sd__tag sd__tag--${status} sd__tag--inline`}>{totalStock(p)} · {STOCK_LABEL[status]}</span></td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="sd__right">
                      <div className="sd__table-actions">
                        <Link to={`/product/${p._id}`} className="link-arrow">Shop</Link>
                        <button
                          type="button"
                          className="sd__delete"
                          onClick={() => onDeleteProduct(p)}
                          disabled={Boolean(deletingProductId)}
                          aria-label={`Delete ${p.title}`}
                          title="Delete product"
                        >
                          {deletingProductId === p._id ? <span className="spinner" /> : <Trash2 size={17} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
