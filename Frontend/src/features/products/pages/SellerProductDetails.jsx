import { useEffect, useState } from 'react'
import { useProduct } from '../hooks/useProduct';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Plus, Minus, Trash2, X, ImagePlus, Layers } from 'lucide-react';
import '../../../styles/sellerProductDetails.scss';

const CURRENCIES = ["INR", "USD", "GBP", "JPY", "EUR"];

const emptyForm = () => ({
  attributes: [{ key: '', value: '' }],
  amount: '',
  currency: 'INR',
  stock: '',
  images: []
});

const SellerProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleGetProductDetail,handleCreateProductVariant } = useProduct();

  async function fetchProductDetaill() {
    setLoading(true);
    try {
      const data = await handleGetProductDetail(productId);
      setProduct(data);
      setVariants(data?.variants || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchProductDetaill()
  }, [productId])

  const formatPrice = (price) =>
    price ? `${price.currency} ${Number(price.amount).toLocaleString()}` : '—';

  const getAttrEntries = (attrs) => {
    if (!attrs) return [];
    return attrs instanceof Map ? [...attrs.entries()] : Object.entries(attrs);
  };

  /* ── form handlers ── */
  const updateAttr = (index, field, value) => {
    setForm((f) => ({
      ...f,
      attributes: f.attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    }));
  };
  const addAttr = () =>
    setForm((f) => ({ ...f, attributes: [...f.attributes, { key: '', value: '' }] }));
  const removeAttr = (index) =>
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, i) => i !== index) }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    const added = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setForm((f) => ({ ...f, images: [...f.images, ...added] }));
    e.target.value = '';
  };
  const removeImage = (index) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm());
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.amount === '' || Number(form.amount) < 0) {
      setFormError('Please enter a valid price for this variant.');
      return;
    }
    const attributes = {};
    form.attributes.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) attributes[key.trim()] = value.trim();
    });
    setFormError('');
    setIsSubmitting(true);
    try {
      const response = await handleCreateProductVariant(productId, {
        title: product.title,
        description: product.description,
        attributes,
        price: { amount: Number(form.amount), currency: form.currency },
        stock: Number(form.stock) || 0,
        images: form.images.map((img) => img.file)
      });
      if (!response?.product) {
        throw new Error(response?.message || 'Failed to create product variant.');
      }
      setProduct(response.product);
      setVariants(response.product.variants || []);
      closeForm();
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || 'Failed to create product variant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── stock handlers ── */
  const setStock = (id, value) => {
    const next = Math.max(0, Number(value) || 0);
    setVariants((list) => list.map((v) => (v._id === id ? { ...v, stock: next } : v)));
  };
  const removeVariant = (id) => setVariants((list) => list.filter((v) => v._id !== id));

  if (loading) return <div className="spd"><div className="spd__state">Loading product...</div></div>;
  if (!product) return <div className="spd"><div className="spd__state">Product not found.</div></div>;

  const images = product.images || [];
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="spd">
      <div className="spd__wrap">
        <Link to="/seller/dashboard" className="spd__back">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        {/* ── Product summary ── */}
        <section className="spd__summary">
          <div>
            <div className="spd__gallery-main">
              {images[activeImage] && <img src={images[activeImage].url} alt={product.title} />}
            </div>
            {images.length > 1 && (
              <div className="spd__thumbs">
                {images.map((img, i) => (
                  <button
                    key={img._id || i}
                    type="button"
                    className={i === activeImage ? 'is-active' : ''}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="spd__title">{product.title}</h1>
            <div className="spd__price">{formatPrice(product.price)}</div>
            <p className="spd__desc">{product.description}</p>
            <div className="spd__stats">
              <div className="spd__stat"><span>Variants</span><strong>{variants.length}</strong></div>
              <div className="spd__stat"><span>Total stock</span><strong>{totalStock}</strong></div>
            </div>
          </div>
        </section>

        {/* ── Variants ── */}
        <section>
          <div className="spd__section-head">
            <h2>Product Variants</h2>
            {!showForm && (
              <button type="button" className="spd__btn" onClick={() => setShowForm(true)}>
                <Plus size={15} /> Add Variant
              </button>
            )}
          </div>

          {showForm && (
            <form className="spd__form" onSubmit={handleSubmit}>
              <div className="spd__attrs">
                <div className="spd__field"><label>Attributes (e.g. size, color)</label></div>
                {form.attributes.map((attr, i) => (
                  <div className="spd__attr-row" key={i}>
                    <input
                      placeholder="Name"
                      value={attr.key}
                      onChange={(e) => updateAttr(i, 'key', e.target.value)}
                    />
                    <input
                      placeholder="Value"
                      value={attr.value}
                      onChange={(e) => updateAttr(i, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      className="spd__icon-btn spd__icon-btn--danger"
                      onClick={() => removeAttr(i)}
                      title="Remove attribute"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" className="spd__btn spd__btn--ghost" style={{ width: 'fit-content' }} onClick={addAttr}>
                  <Plus size={14} /> Add Attribute
                </button>
              </div>

              <div className="spd__row">
                <div className="spd__field">
                  <label>Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="spd__field">
                  <label>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="spd__field">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="spd__field">
                <label>Variant images</label>
                <div className="spd__upload">
                  {form.images.map((img, i) => (
                    <div className="spd__preview" key={i}>
                      <img src={img.url} alt="" />
                      <button type="button" onClick={() => removeImage(i)}><X size={12} /></button>
                    </div>
                  ))}
                  <label className="spd__upload-btn">
                    <ImagePlus size={20} />
                    Add
                    <input type="file" accept="image/*" multiple onChange={handleImages} />
                  </label>
                </div>
              </div>

              {formError && <div className="spd__error">{formError}</div>}

              <div className="spd__actions">
                <button type="button" className="spd__btn spd__btn--ghost" onClick={closeForm}>Cancel</button>
                <button type="submit" className="spd__btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Variant'}
                </button>
              </div>
            </form>
          )}

          {variants.length === 0 && !showForm ? (
            <div className="spd__empty">
              <Layers size={30} />
              <div>No variants yet. Add one to start managing its stock.</div>
            </div>
          ) : (
            <div className="spd__grid" style={{ marginTop: showForm ? 20 : 0 }}>
              {variants.map((v) => (
                <article className="spd__card" key={v._id}>
                  <div className="spd__card-top">
                    <div className="spd__card-imgs">
                      {v.images?.length > 0
                        ? v.images.slice(0, 3).map((img, i) => <img key={img._id || i} src={img.url} alt="" />)
                        : <div><ImagePlus size={18} /></div>}
                    </div>
                    <button
                      type="button"
                      className="spd__icon-btn spd__icon-btn--danger"
                      onClick={() => removeVariant(v._id)}
                      title="Delete variant"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="spd__chips">
                    {getAttrEntries(v.attributes).map(([k, val]) => (
                      <span className="spd__chip" key={k}><b>{k}</b>{val}</span>
                    ))}
                  </div>

                  <div className="spd__card-price">{formatPrice(v.price)}</div>

                  <div className="spd__stock">
                    <div>
                      <div className="spd__stock-label">Stock</div>
                      <span className={`spd__badge ${v.stock > 0 ? 'spd__badge--ok' : 'spd__badge--out'}`}>
                        {v.stock > 0 ? 'In stock' : 'Out of stock'}
                      </span>
                    </div>
                    <div className="spd__stock-ctrl">
                      <button type="button" className="spd__icon-btn" onClick={() => setStock(v._id, (v.stock || 0) - 1)}>
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={v.stock || 0}
                        onChange={(e) => setStock(v._id, e.target.value)}
                      />
                      <button type="button" className="spd__icon-btn" onClick={() => setStock(v._id, (v.stock || 0) + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default SellerProductDetails
