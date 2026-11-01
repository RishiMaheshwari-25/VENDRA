import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../utils/selectors';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Clock, Search, X } from 'lucide-react';
import ProductImage from '../../components/product/ProductImage';
import { formatPrice, productGallery, sortNewest } from '../../utils/product';
import { clearRecent, loadRecent, removeRecent, saveRecent, searchProducts } from './searchProducts';
import { makeHighlighter } from './highlight';
import '../../styles/search.scss';

const MAX_SUGGESTIONS = 6;

const SearchPanel = ({ onClose }) => {
  const products = useSelector(selectProducts);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState(loadRecent);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => searchProducts(products, debounced), [products, debounced]);
  const suggestions = results.slice(0, MAX_SUGGESTIONS);
  const newest = useMemo(() => sortNewest(products).slice(0, 4), [products]);
  const highlight = useMemo(() => makeHighlighter(debounced), [debounced]);
  const hasQuery = debounced.trim().length > 0;

  const goToResults = (q) => {
    const value = (q ?? query).trim();
    if (!value) return;
    saveRecent(value);
    onClose();
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const goToProduct = (product) => {
    if (query.trim()) saveRecent(query);
    onClose();
    navigate(`/product/${product._id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (suggestions.length ? (i - 1 + suggestions.length) % suggestions.length : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!e.shiftKey && active >= 0 && suggestions[active]) goToProduct(suggestions[active]);
      else goToResults();
    }
  };

  return (
        <motion.div
          className="so"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="so__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="so__bar">
              <Search size={20} aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={hasQuery}
                aria-controls="so-results"
                aria-activedescendant={active >= 0 ? `so-opt-${active}` : undefined}
                aria-autocomplete="list"
                placeholder="Search for clothing, footwear, colours, sizes..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(-1);
                }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button type="button" className="so__clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
              <button type="button" className="so__close" onClick={onClose}>
                Esc
              </button>
            </div>

            <div className="so__body">
              <div className="sr-only" aria-live="polite">
                {hasQuery ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : ''}
              </div>

              {hasQuery ? (
                suggestions.length > 0 ? (
                  <>
                    <ul id="so-results" role="listbox" className="so__list">
                      {suggestions.map((p, i) => (
                        <li key={p._id} role="option" id={`so-opt-${i}`} aria-selected={i === active}>
                          <button
                            type="button"
                            className={`so__item ${i === active ? 'is-active' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => goToProduct(p)}
                          >
                            <span className="so__thumb">
                              <ProductImage src={productGallery(p)[0]} alt="" />
                            </span>
                            <span className="so__name">{highlight(p.title)}</span>
                            <span className="so__price">{formatPrice(p.price)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="so__all" onClick={() => goToResults()}>
                      <span>
                        See all {results.length} {results.length === 1 ? 'result' : 'results'} for “{debounced.trim()}”
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </>
                ) : (
                  <div className="so__none" id="so-results">
                    <p className="so__none-title">No results for “{debounced.trim()}”</p>
                    <p>Check the spelling or try a more general word like a colour or type of item.</p>
                    {newest.length > 0 && (
                      <>
                        <span className="so__label">Newest arrivals</span>
                        <div className="so__cards">
                          {newest.map((p) => (
                            <button type="button" key={p._id} className="so__card" onClick={() => goToProduct(p)}>
                              <span className="so__card-img"><ProductImage src={productGallery(p)[0]} alt="" /></span>
                              <span>{p.title}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              ) : (
                <div className="so__idle">
                  {recent.length > 0 && (
                    <section>
                      <div className="so__label-row">
                        <span className="so__label">Recent searches</span>
                        <button type="button" className="so__text-btn" onClick={() => setRecent(clearRecent())}>
                          Clear all
                        </button>
                      </div>
                      <ul className="so__chips">
                        {recent.map((r) => (
                          <li key={r}>
                            <button type="button" className="so__chip" onClick={() => goToResults(r)}>
                              <Clock size={13} /> {r}
                            </button>
                            <button type="button" className="so__chip-x" aria-label={`Remove ${r}`} onClick={() => setRecent(removeRecent(r))}>
                              <X size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {newest.length > 0 && (
                    <section>
                      <span className="so__label">New arrivals</span>
                      <div className="so__cards">
                        {newest.map((p) => (
                          <button type="button" key={p._id} className="so__card" onClick={() => goToProduct(p)}>
                            <span className="so__card-img"><ProductImage src={productGallery(p)[0]} alt="" /></span>
                            <span>{p.title}</span>
                            <small>{formatPrice(p.price)}</small>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  <p className="so__hint">
                    <kbd>↑</kbd> <kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to open · <kbd>Shift</kbd>+<kbd>Enter</kbd> for all results
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
  );
};

// Mounting the panel only while open gives it fresh state (empty query, current recents) each time.
const SearchOverlay = ({ open, onClose }) => (
  <AnimatePresence>{open && <SearchPanel onClose={onClose} />}</AnimatePresence>
);

export default SearchOverlay;
