import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import '../../../styles/create-product.scss';

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'USD',
  });
  const [images, setImages] = useState([]); // Array of File objects (max 7)
  const [previews, setPreviews] = useState([]); // Array of object URLs
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addFiles = (files) => {
    const incoming = Array.from(files);
    const combined = [...images, ...incoming].slice(0, 7);
    setImages(combined);
    const urls = combined.map((f) => (f instanceof File ? URL.createObjectURL(f) : f));
    setPreviews(urls);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim()) return setError('Product title is required.');
    if (!form.priceAmount) return setError('Price is required.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('priceAmount', form.priceAmount);
      formData.append('priceCurrency', form.priceCurrency);
      images.forEach((img) => formData.append('images', img));

      await handleCreateProduct(formData);
      setSuccess('Your piece has been listed successfully!');
      setForm({ title: '', description: '', priceAmount: '', priceCurrency: 'USD' });
      setImages([]);
      setPreviews([]);
      navigate('/seller/dashboard');
    } catch (err) {
      setError('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Left-panel product card data ---------- */
  const sampleCards = [
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsobtexhCI85mv-AzO_AA1HHU5bFwSIbWKduHavA5-EfNjqkfKuJL1p5uEab4cKsyZ6-U4kncZudxWGFqMDP25SWvYihdzT7TUXyBxlU-NsK59wODe5N31KE5i76EKLYWZfolaLLQnfx9PSBiAmXVtxvOPIilA3c1kc_Dtpc_kUJ029uYG5_EHct7zDyKEDGX6S02_fBt9q4HLa1KwxbVMNPHZ7yoSvfxsIoQg0cX9idc2EjXefSW_MT6SH_0RheS9z6NfZYVu2To',
      name: 'Midnight Amethyst Couture Gown',
      sub: 'Valentino Archival • Edition 01/01',
      price: '$4,850',
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD81qzo7rWEO_IBTd6bxW68119CaiMr8EuZpx1DcTgYjxUH7j357T_MWxBoDAj_wvjgSOA5sJw_VJzHDIyJodqdPASBtvGSRWsYEKelRr16bJutxRO5St8Q3-oPiLy-C0pbtrLXxnL-oBhw_yyN6Z1_Z7zeM8fut_7Ee3XxZ_2ve1m7sKNHeMCYfAV54BGT9PLYewfhXdpmceAzj6ddvzdxsMN-Dmqo1d-Dl0-VhyG9Hxfsawc3qnM5F0-B97bu_hXAn6cVELngqcU',
      name: 'Obsidian Tailored Architectural Blazer',
      sub: 'Mugler Silhouette • S/S 2024',
      price: '$2,100',
    },
  ];

  return (
    <div className="cp-page">
      {/* ===================== LEFT PANEL ===================== */}
      <aside className="cp-left">
        {/* Ambient glows */}
        <div className="cp-left__glow-top" />
        <div className="cp-left__glow-bottom" />
        <div className="cp-left__rings" />

        {/* Brand header */}
        <div className="cp-left__header">
          <div className="cp-brand">
            <div className="cp-brand__monogram">V</div>
            <span className="cp-brand__name">VENDRA</span>
          </div>
          <span className="cp-salon-badge">
            <span className="cp-salon-badge__dot" />
            SALON ACTIVE
          </span>
        </div>

        {/* Editorial copy + floating cards */}
        <div className="cp-left__body">
          <div className="cp-left__tagline">
            <h1 className="cp-left__headline">List Your Piece.</h1>
            <p className="cp-left__sub">Reach verified collectors worldwide through secure provenance curation.</p>
          </div>

          <div className="cp-cards">
            {sampleCards.map((card, i) => (
              <div className="cp-card" key={i}>
                <div className="cp-card__thumb">
                  <img src={card.img} alt={card.name} />
                  <div className="cp-card__thumb-vignette" />
                </div>
                <div className="cp-card__info">
                  <div className="cp-card__meta">
                    <span className="cp-badge cp-badge--verified">
                      <span className="cp-badge__dot cp-badge__dot--green" />
                      VERIFIED
                    </span>
                    <span className="cp-card__price">{card.price}</span>
                  </div>
                  <h4 className="cp-card__name">{card.name}</h4>
                  <p className="cp-card__sub">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust pills */}
          <div className="cp-trust-pills">
            <span className="cp-trust-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Escrow Protected
            </span>
            <span className="cp-trust-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              White-Glove Delivery
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="cp-stats">
          <span>3.8M+ Items Listed</span>
          <span className="cp-stats__dot" />
          <span>200K+ Collectors</span>
          <span className="cp-stats__dot" />
          <span className="cp-stats__highlight">100% Authenticated</span>
        </div>
      </aside>

      {/* ===================== RIGHT PANEL ===================== */}
      <main className="cp-right">
        <div className="cp-right__glow" />

        {/* Top bar */}
        <div className="cp-right__topbar">
          <div className="cp-right__topbar-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            NEW LISTING
          </div>
          <Link to="/seller/dashboard" className="cp-right__close-btn" title="Return to Atelier Dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Link>
        </div>

        {/* Form header */}
        <div className="cp-form-header">
          <h2 className="cp-form-header__title">Create New Listing</h2>
          <p className="cp-form-header__sub">Fill in the details to list your item on the Vendra marketplace</p>
        </div>

        {/* Alerts */}
        {error && <div className="cp-alert cp-alert--error">{error}</div>}
        {success && <div className="cp-alert cp-alert--success">{success}</div>}

        {/* Form */}
        <form className="cp-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="cp-field">
            <label className="cp-field__label">Product Title <span className="cp-field__required">*</span></label>
            <div className="cp-input-pill">
              <svg className="cp-input-pill__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <circle cx="7" cy="7" r="1" fill="currentColor" />
              </svg>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Midnight Velvet Blazer"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Description */}
          <div className="cp-field">
            <label className="cp-field__label">
              Description & Provenance <span className="cp-field__required">*</span>
              <span className="cp-field__hint">Max 600 chars</span>
            </label>
            <div className="cp-input-textarea">
              <svg className="cp-input-textarea__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
              </svg>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe materials, condition, sizing..."
                rows={3}
                maxLength={600}
              />
            </div>
          </div>

          {/* Price + Currency */}
          <div className="cp-price-row">
            <div className="cp-field cp-field--price">
              <label className="cp-field__label">Listing Price <span className="cp-field__required">*</span></label>
              <div className="cp-input-pill">
                <svg className="cp-input-pill__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <input
                  type="number"
                  name="priceAmount"
                  value={form.priceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="cp-field cp-field--currency">
              <label className="cp-field__label">Currency</label>
              <div className="cp-input-pill cp-input-pill--select">
                <svg className="cp-input-pill__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                <select name="priceCurrency" value={form.priceCurrency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
                <svg className="cp-input-pill__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="cp-field">
            <div className="cp-field__label-row">
              <label className="cp-field__label">
                Product Images <span className="cp-field__hint-inline">(up to 7)</span>
              </label>
              {images.length > 0 && (
                <span className="cp-field__count">{images.length} / 7 uploaded</span>
              )}
            </div>

            {/* Dropzone */}
            <div
              className={`cp-dropzone${dragging ? ' cp-dropzone--active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="cp-dropzone__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                </svg>
              </div>
              <div className="cp-dropzone__text">
                <p>Drag & drop or click to browse</p>
                <span>PNG, JPG, WEBP accepted</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>

            {/* Image slots */}
            <div className="cp-img-slots">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`cp-img-slot${previews[i] ? ' cp-img-slot--filled' : ''}`}
                  onClick={() => !previews[i] && fileInputRef.current?.click()}
                >
                  {previews[i] ? (
                    <>
                      <img src={previews[i]} alt={`Preview ${i + 1}`} />
                      <div className="cp-img-slot__overlay">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="cp-actions">
            <button type="submit" className="cp-btn-submit" disabled={loading}>
              {loading ? (
                <span className="cp-btn-submit__spinner" />
              ) : (
                <>
                  <span>List Product</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
            <div className="cp-redirect">
              <span>Already have active items?</span>
              <Link to="/my-listings" className="cp-redirect__link">View your listings →</Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProduct;