import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../utils/selectors';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { Stagger } from '../../components/ui/Reveal';
import { SORTS, attributeFacets, formatPrice, getAttributeEntries, stockStatus } from '../../utils/product';
import { searchProducts } from './searchProducts';
import { makeHighlighter } from './highlight';
import '../../styles/search.scss';
import '../../styles/product-card.scss';

const hasAttr = (product, key, values) =>
  (product.variants || []).some((v) =>
    getAttributeEntries(v.attributes).some(([k, val]) => String(k).trim() === key && values.includes(String(val).trim()))
  );

const SearchResults = ({ q, setParams }) => {
  const products = useSelector(selectProducts);
  const loaded = useSelector((state) => state.product?.loaded);

  const [draft, setDraft] = useState(q);
  const [sort, setSort] = useState(q ? 'relevance' : 'newest');
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(null);
  const [attrs, setAttrs] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);

  const base = useMemo(() => (q.trim() ? searchProducts(products, q) : products), [products, q]);
  const facets = useMemo(() => attributeFacets(base), [base]);

  // A price filter only makes sense when everything is priced in one currency.
  const currencies = useMemo(() => new Set(base.map((p) => p.price?.currency).filter(Boolean)), [base]);
  const priceBounds = useMemo(() => {
    if (currencies.size !== 1 || base.length < 2) return null;
    const amounts = base.map((p) => Number(p.price?.amount) || 0);
    const min = Math.floor(Math.min(...amounts));
    const max = Math.ceil(Math.max(...amounts));
    return min === max ? null : { min, max, currency: [...currencies][0] };
  }, [base, currencies]);

  const cap = priceBounds && maxPrice !== null ? Math.min(maxPrice, priceBounds.max) : priceBounds?.max;

  const filtered = useMemo(() => {
    let list = base.filter((p) => {
      if (inStock && !['in', 'low'].includes(stockStatus(p))) return false;
      if (priceBounds && (Number(p.price?.amount) || 0) > cap) return false;
      return Object.entries(attrs).every(([key, values]) => !values.length || hasAttr(p, key, values));
    });
    if (sort !== 'relevance') list = [...list].sort((SORTS[sort] || SORTS.newest).fn);
    return list;
  }, [base, inStock, priceBounds, cap, attrs, sort]);

  const highlight = useMemo(() => makeHighlighter(q), [q]);

  const toggleAttr = (key, value) =>
    setAttrs((cur) => {
      const list = cur[key] || [];
      return { ...cur, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });

  const activeChips = [
    ...Object.entries(attrs).flatMap(([key, values]) => values.map((v) => ({ id: `${key}:${v}`, label: `${key}: ${v}`, clear: () => toggleAttr(key, v) }))),
    ...(inStock ? [{ id: 'stock', label: 'In stock', clear: () => setInStock(false) }] : []),
    ...(priceBounds && cap < priceBounds.max
      ? [{ id: 'price', label: `Up to ${formatPrice({ amount: cap, currency: priceBounds.currency })}`, clear: () => setMaxPrice(null) }]
      : []),
  ];
  const resetAll = () => {
    setAttrs({});
    setInStock(false);
    setMaxPrice(null);
  };

  const submit = (e) => {
    e.preventDefault();
    const value = draft.trim();
    setParams(value ? { q: value } : {});
  };

  const sortOptions = q ? { relevance: { label: 'Relevance' }, ...SORTS } : SORTS;

  return (
    <div className="container sp">
      <header className="sp__head">
        <span className="eyebrow">{q ? 'Search results' : 'All products'}</span>
        <h1>{q ? <>“{q}”</> : 'Shop everything'}</h1>
        <form className="sp__form" onSubmit={submit} role="search">
          <Search size={17} aria-hidden="true" />
          <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Refine your search" aria-label="Search products" />
          {draft && (
            <button type="button" onClick={() => { setDraft(''); setParams({}); }} aria-label="Clear search"><X size={15} /></button>
          )}
        </form>
      </header>

      <div className="sp__bar">
        <p className="sp__count" aria-live="polite">
          {loaded ? `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}` : 'Loading…'}
        </p>
        <button type="button" className="sp__filter-btn" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
          <SlidersHorizontal size={15} /> Filters{activeChips.length ? ` (${activeChips.length})` : ''}
        </button>
        <label className="sp__sort">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(sortOptions).map(([key, o]) => (
              <option key={key} value={key}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {activeChips.length > 0 && (
        <ul className="sp__chips">
          {activeChips.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={c.clear}>{c.label} <X size={12} /></button>
            </li>
          ))}
          <li><button type="button" className="sp__reset" onClick={resetAll}>Clear all</button></li>
        </ul>
      )}

      <div className="sp__layout">
        <aside className={`sp__filters ${panelOpen ? 'is-open' : ''}`} aria-label="Filters">
          <label className="sp__check">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            <span>In stock only</span>
          </label>

          {priceBounds && (
            <div className="sp__group">
              <h3>Max price</h3>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={cap}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
              />
              <div className="sp__range-label">
                <span>{formatPrice({ amount: priceBounds.min, currency: priceBounds.currency })}</span>
                <strong>{formatPrice({ amount: cap, currency: priceBounds.currency })}</strong>
              </div>
            </div>
          )}

          {Object.entries(facets).map(([key, values]) => (
            <div className="sp__group" key={key}>
              <h3>{key}</h3>
              <div className="sp__opts">
                {values.map((v) => {
                  const on = (attrs[key] || []).includes(v);
                  return (
                    <button type="button" key={v} className={on ? 'is-on' : ''} aria-pressed={on} onClick={() => toggleAttr(key, v)}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!priceBounds && Object.keys(facets).length === 0 && <p className="sp__nofilter">More filters appear as sellers add product options.</p>}
        </aside>

        <section>
          {!loaded ? (
            <div className="pgrid pgrid--skeleton">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <Stagger key={`${q}-${sort}-${filtered.length}`} className="pgrid" gap={0.05}>
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} highlight={q ? highlight : undefined} />
              ))}
            </Stagger>
          ) : (
            <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="empty__icon"><Search size={24} /></div>
              <h2>{q ? `Nothing found for “${q}”` : 'No products yet'}</h2>
              <p>
                {activeChips.length
                  ? 'Your filters are hiding every match. Try removing some.'
                  : q
                    ? 'Check the spelling, or try a more general word such as a colour or type of item.'
                    : 'Products will appear here as soon as sellers list them.'}
              </p>
              {activeChips.length > 0 ? (
                <button type="button" className="btn--solid" onClick={resetAll}><span>Clear filters</span></button>
              ) : q ? (
                <Link to="/search" className="btn--solid"><span>Browse everything</span></Link>
              ) : null}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  return <SearchResults key={q} q={q} setParams={setParams} />;
};

export default SearchPage;
