import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, Layers, Plus, X } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import ProductImage from '../../../components/product/ProductImage';
import { Stagger } from '../../../components/ui/Reveal';
import { fadeUp } from '../../../components/ui/motion';
import { useToast } from '../../../components/ui/toastContext';
import { formatPrice, getAttributeEntries, imageUrls, totalStock } from '../../../utils/product';
import '../../../styles/seller.scss';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];

const emptyForm = (currency = 'INR') => ({
  attributes: [{ key: '', value: '' }],
  amount: '',
  currency,
  stock: '',
  images: [],
});

const SellerProductDetailsInner = ({ productId }) => {
  const { handleGetProductDetail, handleCreateProductVariant } = useProduct();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [active, setActive] = useState(0);
  const [panel, setPanel] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let current = true;
    handleGetProductDetail(productId)
      .then((data) => {
        if (!current) return;
        if (!data) return setStatus('missing');
        setProduct(data);
        setStatus('ready');
      })
      .catch(() => current && setStatus('missing'));
    return () => {
      current = false;
    };
  }, [productId, handleGetProductDetail]);

  const variants = product?.variants || [];

  const openPanel = () => {
    setForm(emptyForm(product?.price?.currency || 'INR'));
    setFormError('');
    setPanel(true);
  };
  const closePanel = () => {
    form.images.forEach((i) => URL.revokeObjectURL(i.url));
    setPanel(false);
  };

  const setAttr = (index, field, value) =>
    setForm((f) => ({ ...f, attributes: f.attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a)) }));
  const addAttr = () => setForm((f) => ({ ...f, attributes: [...f.attributes, { key: '', value: '' }] }));
  const removeAttr = (index) => setForm((f) => ({ ...f, attributes: f.attributes.filter((_, i) => i !== index) }));

  const addImages = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setForm((f) => ({ ...f, images: [...f.images, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))] }));
    e.target.value = '';
  };
  const removeImage = (index) =>
    setForm((f) => {
      URL.revokeObjectURL(f.images[index].url);
      return { ...f, images: f.images.filter((_, i) => i !== index) };
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.amount === '' || Number(form.amount) < 0) return setFormError('Enter a valid price for this variant.');
    const attributes = {};
    form.attributes.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) attributes[key.trim()] = value.trim();
    });
    setFormError('');
    setSaving(true);
    try {
      const response = await handleCreateProductVariant(productId, {
        title: product.title,
        description: product.description,
        attributes,
        price: { amount: Number(form.amount), currency: form.currency },
        stock: Number(form.stock) || 0,
        images: form.images.map((i) => i.file),
      });
      if (!response?.product) throw new Error(response?.message || 'Failed to create the variant.');
      setProduct(response.product);
      closePanel();
      toast('Variant added');
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create the variant.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container spd">
        <div className="spd__top">
          <div className="skeleton" style={{ aspectRatio: '4/5' }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }
  if (status === 'missing') {
    return (
      <div className="container">
        <div className="empty">
          <h2>Product not found</h2>
          <Link to="/seller/dashboard" className="btn--solid"><span>Back to dashboard</span></Link>
        </div>
      </div>
    );
  }

  const images = imageUrls(product.images);

  return (
    <div className="container spd">
      <Link to="/seller/dashboard" className="back-link">← Back to dashboard</Link>

      <section className="spd__top">
        <div>
          <div className="spd__main"><ProductImage src={images[active]} alt={product.title} loading="eager" /></div>
          {images.length > 1 && (
            <div className="spd__thumbs">
              {images.map((url, i) => (
                <button key={url + i} type="button" className={i === active ? 'is-on' : ''} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <ProductImage src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="spd__summary">
          <span className="eyebrow">Product</span>
          <h1>{product.title}</h1>
          <strong>{formatPrice(product.price)}</strong>
          <p>{product.description}</p>
          <dl>
            <div><dt>Variants</dt><dd>{variants.length}</dd></div>
            <div><dt>Units in stock</dt><dd>{totalStock(product)}</dd></div>
          </dl>
          <Link to={`/product/${product._id}`} className="link-arrow">View in shop</Link>
        </div>
      </section>

      <section>
        <div className="section-head spd__head">
          <h2>Variants</h2>
          <button type="button" className="btn--solid" onClick={openPanel}><Plus size={16} /> <span>Add variant</span></button>
        </div>

        {variants.length === 0 ? (
          <div className="empty">
            <div className="empty__icon"><Layers size={24} /></div>
            <h3>No variants yet</h3>
            <p>Shoppers can only buy a product once it has at least one variant with stock.</p>
          </div>
        ) : (
          <Stagger className="spd__grid" gap={0.06}>
            {variants.map((v) => {
              const stock = Number(v.stock) || 0;
              const imgs = imageUrls(v.images);
              return (
                <motion.article key={v._id} className="spd__card" variants={fadeUp}>
                  <div className="spd__card-imgs">
                    {imgs.length ? imgs.slice(0, 3).map((u, i) => <ProductImage key={u + i} src={u} alt="" />) : <span><ImagePlus size={18} /></span>}
                  </div>
                  <ul className="spd__chips">
                    {getAttributeEntries(v.attributes).map(([k, val]) => <li key={k}><b>{k}</b> {String(val)}</li>)}
                  </ul>
                  <div className="spd__card-foot">
                    <strong>{formatPrice(v.price || product.price)}</strong>
                    <span className={`sd__tag sd__tag--inline sd__tag--${stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'in'}`}>
                      {stock <= 0 ? 'Sold out' : `${stock} in stock`}
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </Stagger>
        )}
      </section>

      <AnimatePresence>
        {panel && (
          <>
            <motion.div className="slide__scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePanel} />
            <motion.aside
              className="slide"
              role="dialog"
              aria-label="Add variant"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="slide__head">
                <h2>New variant</h2>
                <button type="button" onClick={closePanel} aria-label="Close"><X size={20} /></button>
              </div>

              <form onSubmit={onSubmit} className="slide__form">
                {formError && <div className="alert alert--error" role="alert">{formError}</div>}

                <fieldset>
                  <legend>Options (for example Size = M, Colour = Black)</legend>
                  {form.attributes.map((a, i) => (
                    <div className="slide__attr" key={i}>
                      <input placeholder="Name" value={a.key} onChange={(e) => setAttr(i, 'key', e.target.value)} aria-label="Option name" />
                      <input placeholder="Value" value={a.value} onChange={(e) => setAttr(i, 'value', e.target.value)} aria-label="Option value" />
                      <button type="button" onClick={() => removeAttr(i)} aria-label="Remove option" disabled={form.attributes.length === 1}><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" className="link-arrow" onClick={addAttr}><Plus size={13} /> Add option</button>
                </fieldset>

                <div className="cp__row">
                  <div className="ffield">
                    <input id="v-price" type="number" min="0" placeholder=" " value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    <label htmlFor="v-price">Price</label>
                  </div>
                  <div className="ffield">
                    <select id="v-cur" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <label htmlFor="v-cur">Currency</label>
                  </div>
                </div>

                <div className="ffield">
                  <input id="v-stock" type="number" min="0" placeholder=" " value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  <label htmlFor="v-stock">Units in stock</label>
                </div>

                <div>
                  <span className="eyebrow">Variant images</span>
                  <div className="slide__imgs">
                    {form.images.map((img, i) => (
                      <div key={img.url}><img src={img.url} alt="" /><button type="button" onClick={() => removeImage(i)} aria-label="Remove image"><X size={11} /></button></div>
                    ))}
                    <label className="slide__add">
                      <ImagePlus size={20} />
                      <input type="file" accept="image/*" multiple hidden onChange={addImages} />
                    </label>
                  </div>
                </div>

                <div className="slide__foot">
                  <button type="button" className="btn--outline" onClick={closePanel}>Cancel</button>
                  <button type="submit" className="btn--solid" disabled={saving}>{saving ? <span className="spinner" /> : <span>Create variant</span>}</button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SellerProductDetails = () => {
  const { productId } = useParams();
  return <SellerProductDetailsInner key={productId} productId={productId} />;
};

export default SellerProductDetails;
