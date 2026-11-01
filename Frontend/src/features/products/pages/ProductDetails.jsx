import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../utils/selectors';
import { Link, useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Link2, ShoppingBag, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import ProductCard from '../../../components/product/ProductCard';
import ProductImage from '../../../components/product/ProductImage';
import WishlistButton from '../../wishlist/components/WishlistButton';
import Reveal, { Stagger } from '../../../components/ui/Reveal';
import { useToast } from '../../../components/ui/toastContext';
import { useAddToBag } from '../../../hooks/useAddToBag';
import { useProduct } from '../hooks/useProduct';
import { PROMISES } from '../../../config/storefront';
import { formatPrice, getAttributeEntries, imageUrls, productGallery } from '../../../utils/product';
import '../../../styles/product-details.scss';
import '../../../styles/product-card.scss';

const PERK_ICONS = { shipping: Truck, returns: RotateCcw, payment: ShieldCheck };
const COLOR_KEY = /^(colou?r|shade|tone|pattern)$/i;
const SIZE_KEY = /^(size|dimension)$/i;

const ProductDetailsInner = ({ productId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const addToBag = useAddToBag();
  const { handleGetProductDetail } = useProduct();
  const user = useSelector((state) => state.auth?.user);
  const catalogue = useSelector(selectProducts);
  const canBuy = user?.role !== 'seller';

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing
  const [selected, setSelected] = useState({});
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    let current = true;
    handleGetProductDetail(productId)
      .then((data) => {
        if (!current) return;
        if (!data) return setStatus('missing');
        setProduct(data);
        const firstInStock = (data.variants || []).find((v) => Number(v.stock) > 0) || data.variants?.[0];
        setSelected(Object.fromEntries(getAttributeEntries(firstInStock?.attributes)));
        setActive(0);
        setStatus('ready');
      })
      .catch(() => current && setStatus('missing'));
    return () => {
      current = false;
    };
  }, [productId, handleGetProductDetail]);

  const variants = useMemo(() => product?.variants || [], [product]);
  const variantAttrs = useMemo(() => variants.map((v) => Object.fromEntries(getAttributeEntries(v.attributes))), [variants]);

  const groups = useMemo(() => {
    const g = {};
    variantAttrs.forEach((attrs) => Object.entries(attrs).forEach(([k, v]) => (g[k] ||= new Set()).add(v)));
    return g;
  }, [variantAttrs]);
  const keys = Object.keys(groups);
  const colorKey = keys.find((k) => COLOR_KEY.test(k));
  const sizeKey = keys.find((k) => SIZE_KEY.test(k));
  const otherKeys = keys.filter((k) => k !== colorKey && k !== sizeKey);

  const exactIndex = variantAttrs.findIndex((a) => keys.length > 0 && keys.every((k) => a[k] === selected[k]));
  const selectedVariant = exactIndex >= 0 ? variants[exactIndex] : null;

  const gallery = useMemo(() => {
    const own = imageUrls(selectedVariant?.images);
    return own.length ? own : productGallery(product);
  }, [selectedVariant, product]);

  const price = selectedVariant?.price || product?.price;
  const stock = selectedVariant ? Number(selectedVariant.stock) || 0 : null;

  // Is this option value available given the other current selections?
  const optionStock = (key, value) => {
    const idx = variantAttrs.findIndex((a) => a[key] === value && Object.entries(selected).every(([k, v]) => k === key || a[k] === v));
    const fallback = idx >= 0 ? idx : variantAttrs.findIndex((a) => a[key] === value);
    return fallback >= 0 ? Number(variants[fallback]?.stock) || 0 : 0;
  };

  const choose = (key, value) => {
    const rest = Object.entries(selected).filter(([k]) => k !== key);
    const match =
      variantAttrs.find((a) => a[key] === value && rest.every(([k, v]) => a[k] === v)) ||
      variantAttrs.find((a) => a[key] === value);
    setSelected(match ? { ...match } : { ...Object.fromEntries(rest), [key]: value });
    setActive(0);
  };

  const swatchImage = (value) => {
    const idx = variantAttrs.findIndex((a) => a[colorKey] === value && imageUrls(variants[variantAttrs.indexOf(a)]?.images).length);
    const v = variants[idx >= 0 ? idx : variantAttrs.findIndex((a) => a[colorKey] === value)];
    return imageUrls(v?.images)[0] || productGallery(product)[0];
  };

  const related = useMemo(() => {
    if (!product) return { title: '', list: [] };
    const others = catalogue.filter((p) => p._id !== product._id);
    const sameSeller = others.filter((p) => String(p.seller) === String(product.seller));
    return sameSeller.length
      ? { title: 'More from this seller', list: sameSeller.slice(0, 4) }
      : { title: 'You may also like', list: others.slice(0, 4) };
  }, [catalogue, product]);

  const needsSelection = variants.length > 0 && !selectedVariant;
  const soldOut = variants.length > 0 && stock !== null && stock <= 0;
  const noVariants = variants.length === 0;

  const handleAdd = async () => {
    if (needsSelection) return toast('Please choose all options first', 'error');
    setBusy(true);
    const ok = await addToBag(product, selectedVariant, stageRef.current);
    setBusy(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
    return ok;
  };

  const handleBuyNow = async () => {
    if (needsSelection) return toast('Please choose all options first', 'error');
    setBusy(true);
    const ok = await addToBag(product, selectedVariant, stageRef.current);
    setBusy(false);
    if (ok) navigate('/cart');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied');
    } catch {
      toast('Copy is not available in this browser', 'error');
    }
  };

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  if (status === 'loading') {
    return (
      <div className="container pd">
        <div className="pd__layout">
          <div className="skeleton" style={{ aspectRatio: '4/5' }} />
          <div className="pd__skel">
            <div className="skeleton" style={{ height: 14, width: '30%' }} />
            <div className="skeleton" style={{ height: 44, width: '80%' }} />
            <div className="skeleton" style={{ height: 22, width: '25%' }} />
            <div className="skeleton" style={{ height: 90 }} />
            <div className="skeleton" style={{ height: 52 }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="container">
        <div className="empty" style={{ minHeight: '50vh', justifyContent: 'center' }}>
          <h2>Product not found</h2>
          <p>This product may have been removed or the link is incorrect.</p>
          <Link to="/search" className="btn--solid"><span>Browse products</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pd">
      <nav className="pd__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <Link to="/search">Shop</Link> <span>/</span> <span aria-current="page">{product.title}</span>
      </nav>

      <div className="pd__layout">
        {/* Gallery */}
        <div className="pd__gallery">
          {gallery.length > 1 && (
            <div className="pd__thumbs">
              {gallery.map((url, i) => (
                <button key={url + i} type="button" className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}>
                  <ProductImage src={url} alt="" />
                </button>
              ))}
            </div>
          )}

          <div
            className="pd__stage"
            ref={stageRef}
            onMouseMove={onMove}
            onMouseLeave={() => setZoom(null)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={gallery[active] || 'none'}
                className="pd__img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductImage src={gallery[active]} alt={product.title} loading="eager" />
                {zoom && gallery[active] && (
                  <span
                    className="pd__zoom"
                    style={{ backgroundImage: `url("${gallery[active]}")`, backgroundPosition: `${zoom.x}% ${zoom.y}%` }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {gallery.length > 1 && (
              <>
                <button type="button" className="pd__arrow pd__arrow--prev" onClick={() => setActive((i) => (i - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ChevronLeft size={20} /></button>
                <button type="button" className="pd__arrow pd__arrow--next" onClick={() => setActive((i) => (i + 1) % gallery.length)} aria-label="Next image"><ChevronRight size={20} /></button>
                <span className="pd__count">{active + 1} / {gallery.length}</span>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <motion.div className="pd__info" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="pd__title-row">
            <h1 className="pd__title">{product.title}</h1>
            <WishlistButton product={product} className="wish--outline" size={20} />
          </div>

          <div className="pd__price">
            <motion.span key={price?.amount + String(price?.currency)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {formatPrice(price)}
            </motion.span>
          </div>

          {colorKey && (
            <section className="pd__opt" aria-label="Colour">
              <div className="pd__opt-head">
                <h3>{colorKey}</h3>
                <span>{selected[colorKey]}</span>
              </div>
              <div className="pd__swatches">
                {[...groups[colorKey]].map((value) => {
                  const on = selected[colorKey] === value;
                  return (
                    <button key={value} type="button" className={`pd__swatch ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={value} title={value} onClick={() => choose(colorKey, value)}>
                      <ProductImage src={swatchImage(value)} alt="" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {sizeKey && (
            <section className="pd__opt" aria-label="Size">
              <div className="pd__opt-head">
                <h3>{sizeKey}</h3>
                <span>{selected[sizeKey] || 'Select'}</span>
              </div>
              <div className="pd__pills">
                {[...groups[sizeKey]].map((value) => {
                  const on = selected[sizeKey] === value;
                  const out = optionStock(sizeKey, value) <= 0;
                  return (
                    <button key={value} type="button" className={`pd__pill ${on ? 'is-on' : ''} ${out ? 'is-out' : ''}`} aria-pressed={on} onClick={() => choose(sizeKey, value)}>
                      {value}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {otherKeys.map((key) => (
            <section className="pd__opt" key={key} aria-label={key}>
              <div className="pd__opt-head">
                <h3>{key}</h3>
                <span>{selected[key] || 'Select'}</span>
              </div>
              <div className="pd__pills">
                {[...groups[key]].map((value) => {
                  const on = selected[key] === value;
                  const out = optionStock(key, value) <= 0;
                  return (
                    <button key={value} type="button" className={`pd__pill ${on ? 'is-on' : ''} ${out ? 'is-out' : ''}`} aria-pressed={on} onClick={() => choose(key, value)}>
                      {value}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Stock message, from real stock only */}
          {selectedVariant && (
            <p className={`pd__stock ${stock <= 0 ? 'is-out' : stock <= 5 ? 'is-low' : ''}`}>
              <i />
              {stock <= 0 ? 'Sold out in this option' : stock <= 5 ? `Only ${stock} left` : 'In stock'}
            </p>
          )}
          {noVariants && <p className="pd__stock is-out"><i />Not available yet</p>}

          {canBuy && (
            <div className="pd__actions">
              <button type="button" className="btn--solid" onClick={handleAdd} disabled={busy || soldOut || noVariants}>
                {added ? <Check size={16} /> : busy ? <span className="spinner" /> : <ShoppingBag size={16} />}
                <span>{added ? 'Added to bag' : soldOut ? 'Sold out' : 'Add to bag'}</span>
              </button>
              <button type="button" className="btn--outline" onClick={handleBuyNow} disabled={busy || soldOut || noVariants}>
                <span>Buy now</span>
              </button>
            </div>
          )}

          <div className="pd__acc">
            <button type="button" className="pd__acc-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              <span>Description</span>
              <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} style={{ overflow: 'hidden' }}>
                  <p className="pd__desc">{product.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ul className="pd__perks">
            {PROMISES.map((p) => {
              const Icon = PERK_ICONS[p.key] || ShieldCheck;
              return <li key={p.key}><Icon size={16} /><span>{p.long}</span></li>;
            })}
          </ul>

          <button type="button" className="pd__share" onClick={copyLink}><Link2 size={14} /> Copy link</button>
        </motion.div>
      </div>

      {related.list.length > 0 && (
        <section className="pd__related">
          <Reveal><h2>{related.title}</h2></Reveal>
          <Stagger className="pgrid pgrid--4">
            {related.list.map((p) => <ProductCard key={p._id} product={p} />)}
          </Stagger>
        </section>
      )}

      {/* Sticky purchase bar for small screens */}
      {canBuy && !noVariants && (
        <div className="pd__sticky">
          <div>
            <strong>{product.title}</strong>
            <span>{formatPrice(price)}</span>
          </div>
          <button type="button" className="btn--solid" onClick={handleAdd} disabled={busy || soldOut}>
            <span>{soldOut ? 'Sold out' : added ? 'Added' : 'Add to bag'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const { productId } = useParams();
  return <ProductDetailsInner key={productId} productId={productId} />;
};

export default ProductDetails;
