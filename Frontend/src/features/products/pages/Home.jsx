import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useNavigate } from 'react-router';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Heart,
  Eye,
  CheckCircle2,
  Lock,
  Plane,
  ShieldCheck,
  ChevronDown,
  X,
  Plus,
  ArrowUpRight,
  User,
  SlidersHorizontal,
  Shirt,
  ExternalLink
} from 'lucide-react';
import '../../../styles/home.scss';

// Fallback curated pieces if backend has zero products or connection is initialising
const CURATED_SAMPLE_PRODUCTS = [
  {
    _id: "6ad1a97f5596c8c4ce536e4f",
    title: "product_1",
    description: "Mens T-shirt crafted with high-thread Egyptian cotton and micro-tailored seamline finish.",
    images: [{ url: "https://ik.imagekit.io/ddymtszym/VENDRA/1000_F_199565283_bFeqVr0L9JNYwTPus3rOUIFQa9ACc0K4_YRsyC_4nS.jpg" }],
    price: { amount: 1000, currency: "INR" },
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-16T04:35:11.121Z",
    updatedAt: "2026-10-16T04:35:11.121Z",
    __v: 0
  },
  {
    _id: "6ad1dc7330e3c482ef252a5c",
    title: "Red -Blazer",
    description: "A structured avant-garde blazer for womens with 100% guarantee of cloth and architectural silhouette.",
    images: [
      { url: "https://ik.imagekit.io/ddymtszym/VENDRA/premium_photo-1675186049366-64a655f8f537_WhpZY48OA.avif" },
      { url: "https://ik.imagekit.io/ddymtszym/VENDRA/premium_photo-1675186049366-64a655f8f537_d9hFXV09a.avif" }
    ],
    price: { amount: 1200, currency: "INR" },
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-16T08:12:35.511Z",
    updatedAt: "2026-10-16T08:12:35.511Z",
    __v: 0
  },
  {
    _id: "6ad1dd6430e3c482ef252a60",
    title: "Mens Pants",
    description: "Upgrade your everyday style with these versatile men’s pants, designed for comfort, durability, and a polished look.",
    images: [{ url: "https://ik.imagekit.io/ddymtszym/VENDRA/images_UCjanL_J6.jpg" }],
    price: { amount: 799, currency: "INR" },
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-16T08:16:36.542Z",
    updatedAt: "2026-10-16T08:16:36.542Z",
    __v: 0
  }
];

const CURRENCY_RATES = {
  INR: { symbol: "₹", rate: 1, label: "INR (₹) - Indian Rupee" },
  USD: { symbol: "$", rate: 0.012, label: "USD ($) - US Dollar" },
  EUR: { symbol: "€", rate: 0.011, label: "EUR (€) - Euro" }
};

const Home = () => {
  const { handleGetAllProducts } = useProduct();
  const rawProducts = useSelector((state) => state.product?.products);
  const currentUser = useSelector((state) => state.auth?.user);
  const navigate=useNavigate();

  // Local state for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [sortBy, setSortBy] = useState('latest');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedModalImg, setSelectedModalImg] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [bagCount, setBagCount] = useState(0);
  const [favorites, setFavorites] = useState({});

  // Fetch all products from API on mount
  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // Safe list of products: uses backend products if available, otherwise sample products
  const displayProducts = useMemo(() => {
    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      return rawProducts;
    }
    return CURATED_SAMPLE_PRODUCTS;
  }, [rawProducts]);

  // Safe image helper
  const getProductImage = (item) => {
    if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === 'string') return first;
      if (first?.url) return first.url;
      if (first?.secure_url) return first.secure_url;
      if (first?.path) return first.path;
    }
    return "/images/designer_bomber_jacket.jpg";
  };

  // Safe all images helper for modal carousel
  const getProductAllImages = (item) => {
    if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images
        .map((img) => (typeof img === 'string' ? img : img?.url || img?.secure_url || img?.path))
        .filter(Boolean);
    }
    return ["/images/designer_bomber_jacket.jpg"];
  };

  // Format price helper
  const formatPrice = (priceObj) => {
    if (!priceObj || typeof priceObj.amount === 'undefined') return 'Price on Request';
    const amountINR = Number(priceObj.amount);
    const curr = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.INR;
    const converted = amountINR * curr.rate;

    if (selectedCurrency === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')} INR`;
    }
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${selectedCurrency}`;
  };

  // USD equivalent calculation
  const getUsdEquivalent = (priceObj) => {
    if (!priceObj || typeof priceObj.amount === 'undefined') return '';
    const amountINR = Number(priceObj.amount);
    const usd = Math.round(amountINR * 0.012);
    return `≈ $${usd} USD`;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return displayProducts
      .filter((item) => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const seller = (item.seller || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        const matchesQuery = title.includes(query) || desc.includes(query) || seller.includes(query);

        if (!matchesQuery) return false;

        if (selectedCategory === 'MENSWEAR') {
          return title.includes('men') || desc.includes('men') || desc.includes('pants') || desc.includes('t-shirt');
        }
        if (selectedCategory === 'WOMENSWEAR') {
          return title.includes('women') || desc.includes('women') || title.includes('blazer') || title.includes('gown');
        }
        if (selectedCategory === 'OUTERWEAR') {
          return title.includes('blazer') || desc.includes('blazer') || title.includes('jacket') || desc.includes('jacket');
        }
        if (selectedCategory === 'ARCHIVAL') {
          return desc.includes('archival') || title.includes('archival') || title.includes('product');
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'asc') {
          return (a.price?.amount || 0) - (b.price?.amount || 0);
        }
        if (sortBy === 'desc') {
          return (b.price?.amount || 0) - (a.price?.amount || 0);
        }
        return 0;
      });
  }, [displayProducts, searchTerm, selectedCategory, sortBy]);

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Favorite toggle handler
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        triggerToast("Saved to your personal curation vault");
      }
      return next;
    });
  };

  return (
    <div className="v-home">
      {/* ── Atmospheric Ambient Glows ── */}
      <div className="v-home__ambient-glow-top" />
      <div className="v-home__ambient-glow-mid" />
      <div className="v-home__ambient-glow-bottom" />

      {/* ── 1. Top Navigation Bar ── */}
      <header className="v-home__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/" className="v-home__brand">
            <div className="v-home__monogram">
              <div className="v-home__monogram-inner">V</div>
            </div>
            <div className="v-home__brand-text">
              VENDRA <span className="v-dot" />
            </div>
          </Link>

          {/* Global Search Bar */}
          <div className="v-home__search-container">
            <Search size={16} className="v-search-icon" />
            <input
              type="text"
              placeholder="Search archival garments, atelier salons, provenance ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="v-kbd">⌘K</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="v-home__nav-links">
          <a href="#catalog" className="v-home__nav-link v-home__nav-link--active">
            Catalog
          </a>
          <a href="#runway" className="v-home__nav-link">
            Runway Drops
          </a>
          <a href="#ateliers" className="v-home__nav-link">
            Ateliers
          </a>
          <a href="#vault" className="v-home__nav-link">
            Archival Vault
          </a>
        </nav>

        {/* Trailing Actions & User Cluster */}
        <div className="v-home__header-actions">
          {/* User state / Profile */}
          {currentUser ? (
            <div className="v-home__user-greeting">
              <span className="v-dot-green" />
              <span>
                Bonjour, <strong style={{ color: '#ffffff' }}>{currentUser.fullname || currentUser.email?.split('@')[0]}</strong>
              </span>
              <span className="v-role-badge">{currentUser.role || 'Collector'}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="v-home__btn-auth">
                Sign In
              </Link>
              <Link to="/register" className="v-home__btn-auth v-home__btn-auth--primary">
                Join Salon
              </Link>
            </div>
          )}

          {/* Seller Dashboard Link (visible for sellers or accessible anytime) */}
          {currentUser?.role === 'seller' && (
            <Link to="/seller/dashboard" className="v-home__btn-dashboard">
              <span>Seller Dashboard</span>
              <ArrowUpRight size={13} />
            </Link>
          )}

          {/* Shopping Bag Icon with live counter */}
          <button
            type="button"
            className="v-home__icon-btn"
            title="Archival Bag"
            onClick={() => triggerToast(`Archival Bag contains ${bagCount} piece(s)`)}
          >
            <ShoppingBag size={20} />
            {bagCount > 0 && <span className="v-badge-count">{bagCount}</span>}
          </button>
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="v-home__main">
        {/* ── 2. Editorial Hero Showcase ── */}
        <section className="v-home__hero">
          <div className="v-home__hero__glow-core" />
          <div className="v-home__hero__glow-secondary" />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div className="v-home__hero__tag">
              <span className="v-pulse-dot" />
              <span>Verified Salon Provenance • Autumn/Winter 2026</span>
            </div>

            <h1 className="v-home__hero__title">
              Curated Haute Couture &amp; <span className="v-italic-accent">Archival Provenance</span>
            </h1>

            <p className="v-home__hero__desc">
              Discover authentic designer pieces, bespoke tailoring, and direct-from-salon creations verified by master ateliers through tamper-proof cryptographic tags.
            </p>

            <div className="v-home__hero__actions">
              <a href="#catalog" className="v-home__hero__btn-explore">
                Explore Salon Creations
              </a>
              {currentUser?.role === 'seller' ? (
                <Link to="/seller/create-product" className="v-home__hero__btn-secondary">
                  <Plus size={16} strokeWidth={2.5} />
                  <span>List New Creation</span>
                </Link>
              ) : (
                <a href="#provenance" className="v-home__hero__btn-secondary">
                  <CheckCircle2 size={16} style={{ color: '#4edea3' }} />
                  <span>Verify Registry Ledger</span>
                </a>
              )}
            </div>

            {/* Trust Badges Ribbon */}
            <div className="v-home__hero__trust-ribbon" id="provenance">
              <div className="v-home__hero__trust-col">
                <div className="v-icon-bubble v-icon-bubble--green">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="v-trust-title">100% Verified Provenance</div>
                  <div className="v-trust-sub">Certified salon signatures</div>
                </div>
              </div>

              <div className="v-home__hero__trust-col">
                <div className="v-icon-bubble v-icon-bubble--purple">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="v-trust-title">Private Escrow Protection</div>
                  <div className="v-trust-sub">Discreet smart vault custody</div>
                </div>
              </div>

              <div className="v-home__hero__trust-col">
                <div className="v-icon-bubble v-icon-bubble--blue">
                  <Plane size={18} />
                </div>
                <div>
                  <div className="v-trust-title">Armored Global Transit</div>
                  <div className="v-trust-sub">White-glove climate control</div>
                </div>
              </div>

              <div className="v-home__hero__trust-col">
                <div className="v-icon-bubble v-icon-bubble--green">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="v-trust-title">Forensic Audit</div>
                  <div className="v-trust-sub">Micro-stitching forensic log</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Catalog Discovery Toolbar ── */}
        <section id="catalog">
          <div className="v-home__toolbar-header">
            <div>
              <span className="v-heading-kicker">Authenticated Collection</span>
              <h2 className="v-heading-title">Atelier Curated Catalog</h2>
            </div>
            <div className="v-count-status">
              <span className="v-pulse-emerald" />
              <span>
                Showing <strong>{filteredProducts.length} pieces</strong> from verified salon sellers
              </span>
            </div>
          </div>

          <div className="v-home__controls-row">
            {/* Category Filter Pills */}
            <div className="v-home__category-tabs">
              <button
                type="button"
                className={`v-home__cat-tab ${selectedCategory === 'ALL' ? 'v-home__cat-tab--active' : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                All Creations ({displayProducts.length})
              </button>
              <button
                type="button"
                className={`v-home__cat-tab ${selectedCategory === 'MENSWEAR' ? 'v-home__cat-tab--active' : ''}`}
                onClick={() => setSelectedCategory('MENSWEAR')}
              >
                Menswear
              </button>
              <button
                type="button"
                className={`v-home__cat-tab ${selectedCategory === 'WOMENSWEAR' ? 'v-home__cat-tab--active' : ''}`}
                onClick={() => setSelectedCategory('WOMENSWEAR')}
              >
                Womenswear
              </button>
              <button
                type="button"
                className={`v-home__cat-tab ${selectedCategory === 'OUTERWEAR' ? 'v-home__cat-tab--active' : ''}`}
                onClick={() => setSelectedCategory('OUTERWEAR')}
              >
                Tailored Outerwear
              </button>
              <button
                type="button"
                className={`v-home__cat-tab ${selectedCategory === 'ARCHIVAL' ? 'v-home__cat-tab--active' : ''}`}
                onClick={() => setSelectedCategory('ARCHIVAL')}
              >
                Archival Pieces
              </button>
            </div>

            {/* Dropdown Cluster (Currency + Sort) */}
            <div className="v-home__dropdown-cluster">
              {/* Currency Selector */}
              <div className="v-home__select-wrap">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
                <ChevronDown size={14} className="v-arrow" />
              </div>

              {/* Sort Dropdown */}
              <div className="v-home__select-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Sort: Latest Drops</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="v-arrow" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Luxury Product Grid ── */}
        {filteredProducts.length > 0 ? (
          <section className="v-home__product-grid">
            {filteredProducts.map((item, idx) => {
              const imgUrl = getProductImage(item);
              const allImgs = getProductAllImages(item);
              const isFav = !!favorites[item._id || idx];

              return (
                <article key={item._id || idx} className="v-home__card">
                  <div>
                    {/* 3:4 Aspect Ratio Image Wrap */}
                    <div className="v-home__card__image-wrap">
                      <img
                        src={imgUrl}
                        alt={item.title || "Product item"}
                        className="v-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/designer_bomber_jacket.jpg";
                        }}
                      />
                      <div className="v-vignette" />

                      {/* Top Overlay Badges */}
                      <div className="v-home__card__top-overlay">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="v-home__card__counter-badge">
                            1 / {allImgs.length} {allImgs.length === 1 ? 'image' : 'images'}
                          </span>
                          <span className="v-home__card__auth-badge">
                            <CheckCircle2 size={11} /> Authenticated
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`v-home__card__btn-fav ${isFav ? 'is-favorited' : ''}`}
                          title={isFav ? "Remove from vault" : "Save to vault"}
                          onClick={() => toggleFavorite(item._id || idx)}
                        >
                          <Heart size={15} fill={isFav ? "#ef4444" : "none"} />
                        </button>
                      </div>

                      {/* Bottom Floating Provenance Hash Bar */}
                      <div className="v-home__card__provenance-bar">
                        <span className="truncate">
                          ID: {(item._id || '').slice(0, 8)}...{(item._id || '').slice(-4)}
                        </span>
                        <span className="v-date">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="v-home__card__body">
                      <div className="v-home__card__header-line">
                        <h3 className="v-home__card__title" title={item.title}>
                          {item.title || "Untitled Piece"}
                        </h3>

                        <div className="v-home__card__price-wrap">
                          <span className="v-price">{formatPrice(item.price)}</span>
                          {selectedCurrency === 'INR' && (
                            <span className="v-usd-eq">{getUsdEquivalent(item.price)}</span>
                          )}
                        </div>
                      </div>

                      <p className="v-home__card__desc">
                        {item.description || "Bespoke handcrafted piece created for discerning private collectors."}
                      </p>

                      <div className="v-home__card__seller-tag">
                        <span>Seller:</span>
                        <code>
                          {typeof item.seller === 'string'
                            ? `${item.seller.slice(0, 8)}...${item.seller.slice(-4)}`
                            : '6ad1a7...229e'}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="v-home__card__actions">
                    <button
                      type="button"
                      className="v-btn-quickview"
                      onClick={()=>navigate(`/product/${item._id}`)}
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>

                    <button
                      type="button"
                      className="v-btn-addbag"
                    >
                      <ShoppingBag size={15} />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="v-home__empty">
            <div className="v-home__empty__icon">
              <Shirt size={32} />
            </div>
            <h3 className="v-home__empty__title">No Pieces Match Your Search</h3>
            <p className="v-home__empty__desc">
              Try adjusting your search terms or explore all creations in our curated atelier catalog.
            </p>
            <button
              type="button"
              className="v-home__hero__btn-explore"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ── Global Luxury Footer ── */}
      <footer className="v-home__footer">
        <div className="v-footer-wrap">
          <div className="v-footer-brand">
            VENDRA <span>• Haute Couture &amp; Designer Marketplace</span>
          </div>
          <div className="v-footer-copy">
            © 2026 Vendra International Salon. All Rights Reserved. Provenance Ledger Active.
          </div>
          <div className="v-footer-links">
            <a href="#terms">Atelier Terms</a>
            <a href="#escrow">Private Escrow</a>
            <a href="#support">Concierge Support</a>
          </div>
        </div>
      </footer>

      ── Quick View Modal ──
      {quickViewProduct && (
        <div
          className="v-home__modal-backdrop"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="v-home__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="v-modal-close"
              onClick={() => setQuickViewProduct(null)}
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Media Col */}
            <div className="v-home__modal-media-col">
              <div className="v-main-img-wrap">
                <img
                  src={getProductAllImages(quickViewProduct)[selectedModalImg] || getProductImage(quickViewProduct)}
                  alt={quickViewProduct.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/designer_bomber_jacket.jpg";
                  }}
                />
              </div>

              {/* Thumbnails Row if multiple images */}
              {getProductAllImages(quickViewProduct).length > 1 && (
                <div className="v-thumbs-row">
                  {getProductAllImages(quickViewProduct).map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Thumb ${i + 1}`}
                      className={selectedModalImg === i ? 'is-selected' : ''}
                      onClick={() => setSelectedModalImg(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Content Col */}
            <div className="v-home__modal-content">
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#4edea3',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '14px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Authenticated Provenance Verified
                </div>

                <h2 className="v-modal-title">{quickViewProduct.title}</h2>
                <div className="v-modal-price">{formatPrice(quickViewProduct.price)}</div>

                <p className="v-modal-desc">
                  {quickViewProduct.description || "Bespoke handcrafted piece created for discerning private collectors."}
                </p>
              </div>

              <div className="v-modal-specs">
                <div className="v-spec-row">
                  <span className="v-spec-k">Item Identifier (_id)</span>
                  <span className="v-spec-v">{quickViewProduct._id || 'N/A'}</span>
                </div>
                <div className="v-spec-row">
                  <span className="v-spec-k">Seller Identifier</span>
                  <span className="v-spec-v">{quickViewProduct.seller || '6ad1a77ce31b273d8b3c229e'}</span>
                </div>
                <div className="v-spec-row">
                  <span className="v-spec-k">Created Timestamp</span>
                  <span className="v-spec-v">{quickViewProduct.createdAt || new Date().toISOString()}</span>
                </div>
                <div className="v-spec-row">
                  <span className="v-spec-k">Last Updated</span>
                  <span className="v-spec-v">{quickViewProduct.updatedAt || new Date().toISOString()}</span>
                </div>
                <div className="v-spec-row">
                  <span className="v-spec-k">Schema Version</span>
                  <span className="v-spec-v">__v: {quickViewProduct.__v ?? 0}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="v-home__hero__btn-explore"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <ShoppingBag size={15} />
                  <span>Acquire Piece / Add to Bag</span>
                </button>

                <button
                  type="button"
                  style={{
                    height: '50px',
                    padding: '0 20px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => setQuickViewProduct(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="v-home__toast">
          <Sparkles size={16} style={{ color: '#ddb7ff' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Home;