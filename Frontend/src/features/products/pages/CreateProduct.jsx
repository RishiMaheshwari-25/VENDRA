import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ImagePlus, X } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import { useToast } from '../../../components/ui/toastContext';
import { formatPrice } from '../../../utils/product';
import '../../../styles/seller.scss';

const MAX_IMAGES = 7;
const MAX_BYTES = 5 * 1024 * 1024; // backend limit
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ title: '', description: '', priceAmount: '', priceCurrency: 'INR' });
  const [images, setImages] = useState([]); // { file, url }
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => images.forEach((i) => URL.revokeObjectURL(i.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const valid = incoming.filter((f) => f.type.startsWith('image/') && f.size <= MAX_BYTES);
    if (valid.length < incoming.length) setError('Only image files up to 5 MB are accepted.');
    else setError('');
    setImages((cur) => [...cur, ...valid.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, MAX_IMAGES));
  };

  const removeImage = (index) =>
    setImages((cur) => {
      URL.revokeObjectURL(cur[index].url);
      return cur.filter((_, i) => i !== index);
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Product title is required.');
    if (!form.description.trim()) return setError('Please add a description.');
    if (form.priceAmount === '' || Number(form.priceAmount) < 0) return setError('Enter a valid price.');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('priceAmount', form.priceAmount);
      fd.append('priceCurrency', form.priceCurrency);
      images.forEach((i) => fd.append('images', i.file));

      const created = await handleCreateProduct(fd);
      if (!created?._id) throw new Error('The product could not be created.');
      toast('Product created. Add variants to make it available.');
      navigate(`/seller/product/${created._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewPrice = form.priceAmount !== '' ? formatPrice({ amount: Number(form.priceAmount), currency: form.priceCurrency }) : '';

  return (
    <div className="container cp">
      <Link to="/seller/dashboard" className="back-link">← Back to dashboard</Link>
      <header className="cp__head">
        <span className="eyebrow">New product</span>
        <h1>Add a product</h1>
        <p>Create the product first, then add variants (size, colour, stock) on the next screen.</p>
      </header>

      <div className="cp__layout">
        <form className="cp__form" onSubmit={onSubmit} noValidate>
          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <div className="ffield">
            <input id="title" name="title" placeholder=" " value={form.title} onChange={onChange} autoComplete="off" />
            <label htmlFor="title">Product title</label>
          </div>

          <div className="ffield">
            <textarea id="description" name="description" placeholder=" " value={form.description} onChange={onChange} rows={4} maxLength={600} />
            <label htmlFor="description">Description</label>
          </div>
          <span className="cp__count">{form.description.length} / 600</span>

          <div className="cp__row">
            <div className="ffield">
              <input id="priceAmount" name="priceAmount" type="number" min="0" step="0.01" placeholder=" " value={form.priceAmount} onChange={onChange} />
              <label htmlFor="priceAmount">Price</label>
            </div>
            <div className="ffield">
              <select id="priceCurrency" name="priceCurrency" value={form.priceCurrency} onChange={onChange}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label htmlFor="priceCurrency">Currency</label>
            </div>
          </div>

          <div>
            <div className="cp__label-row">
              <span className="eyebrow">Images</span>
              <span>{images.length} / {MAX_IMAGES}</span>
            </div>
            <div
              className={`cp__drop ${dragging ? 'is-drag' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
            >
              <ImagePlus size={22} />
              <p><strong>Drop images here</strong> or click to browse</p>
              <small>JPG, PNG or WEBP · up to 5 MB each · max {MAX_IMAGES}</small>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </div>

            {images.length > 0 && (
              <ul className="cp__thumbs">
                {images.map((img, i) => (
                  <li key={img.url}>
                    <img src={img.url} alt={`Upload ${i + 1}`} />
                    <button type="button" onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`}><X size={12} /></button>
                    {i === 0 && <em>Cover</em>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn--solid cp__submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <span>Create product</span>}
          </button>
        </form>

        {/* Live preview of the storefront card */}
        <aside className="cp__preview" aria-label="Preview">
          <span className="eyebrow">Preview</span>
          <div className="pc">
            <div className="pc__media-wrap">
              {images[0] ? <img src={images[0].url} alt="" className="pc__img" /> : <div className="img-fallback">V</div>}
            </div>
            <div className="pc__info">
              <h3 className="pc__title">{form.title || 'Product title'}</h3>
              <span className="pc__price">{previewPrice}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateProduct;
