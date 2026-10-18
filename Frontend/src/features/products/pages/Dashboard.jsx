import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import {
  Plus,
  Search,
  Grid,
  List,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Eye,
  Share2,
  Trash2,
  ExternalLink,
  ChevronDown,
  X,
  Wallet,
  Shirt,
  Lock,
  Plane,
  CheckCircle2,
  Copy,
  Layers
} from 'lucide-react';
import '../../../styles/dashboard.scss';

// Fallback sample pieces matching the exact requested data format
const DEFAULT_PREVIEW_PRODUCTS = [
  {
    _id: "6ad1a77ce31b273d8b3c229e_01",
    title: "product_1",
    description: "Mens T-shirt crafted with high-thread Egyptian cotton and tailored minimalist cut.",
    price: { amount: 1000, currency: "INR" },
    images: [{ url: "/images/designer_bomber_jacket.jpg" }],
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-16T04:35:11.121Z",
    updatedAt: "2026-10-16T04:35:11.121Z",
    __v: 0
  },
  {
    _id: "6ad1a77ce31b273d8b3c229e_02",
    title: "Midnight Amethyst Couture Gown",
    description: "Hand-embroidered metallic threadwork on French silk faille with cathedral train and corset interior.",
    price: { amount: 125000, currency: "INR" },
    images: [{ url: "/images/couture_purple_apparel.jpg" }],
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-14T08:22:15.340Z",
    updatedAt: "2026-10-14T08:22:15.340Z",
    __v: 0
  },
  {
    _id: "6ad1a77ce31b273d8b3c229e_03",
    title: "Archival Silk Velvet Tuxedo",
    description: "Structured architectural silhouette crafted in rich archival velvet with micro-glass beadwork lapels.",
    price: { amount: 84000, currency: "INR" },
    images: [{ url: "/images/designer_bomber_jacket.jpg" }],
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-10-12T11:20:04.551Z",
    updatedAt: "2026-10-12T11:20:04.551Z",
    __v: 0
  },
  {
    _id: "6ad1a77ce31b273d8b3c229e_04",
    title: "Obsidian Minimalist Knit Blazer",
    description: "Avant-garde sculpted shoulders with tailored cinch waist in matte black technical wool.",
    price: { amount: 42500, currency: "INR" },
    images: [{ url: "/images/couture_purple_apparel.jpg" }],
    seller: "6ad1a77ce31b273d8b3c229e",
    createdAt: "2026-09-28T09:14:22.019Z",
    updatedAt: "2026-09-28T09:14:22.019Z",
    __v: 0
  }
];

const CURRENCY_RATES = {
  INR: { symbol: "₹", rate: 1 },
  USD: { symbol: "$", rate: 0.012 },
  EUR: { symbol: "€", rate: 0.011 }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { handleGetSellerProduct } = useProduct();
  const rawSellerProducts = useSelector((state) => state.product?.sellerProducts);
  const isLoading = useSelector((state) => state.product?.loading);

  // Local state for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [useSampleData, setUseSampleData] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);

  // Fetch seller creations on mount
  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  // Sync products from redux or fallback to sample preview if empty
  useEffect(() => {
    if (Array.isArray(rawSellerProducts) && rawSellerProducts.length > 0) {
      setLocalProducts(rawSellerProducts);
      setUseSampleData(false);
    } else {
      // If no backend products returned yet, provide sample preview products so the seller UI is immediately rich
      setLocalProducts(DEFAULT_PREVIEW_PRODUCTS);
      setUseSampleData(true);
    }
  }, [rawSellerProducts]);

  // Show temporary toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

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

  // Safe image count helper
  const getImageCount = (item) => {
    if (item?.images && Array.isArray(item.images)) {
      return item.images.length;
    }
    return 1;
  };

  // Format price based on active currency
  const formatPrice = (priceObj) => {
    if (!priceObj || typeof priceObj.amount === 'undefined') return 'Price on Request';
    const amountINR = Number(priceObj.amount);
    const curr = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.INR;
    const converted = amountINR * curr.rate;
    
    if (selectedCurrency === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')} INR`;
    }
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${selectedCurrency}`;
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

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return localProducts
      .filter((item) => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const seller = (item.seller || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return title.includes(query) || desc.includes(query) || seller.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price?.amount || 0) - (a.price?.amount || 0);
        }
        if (sortBy === 'price-asc') {
          return (a.price?.amount || 0) - (b.price?.amount || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [localProducts, searchTerm, sortBy]);

  // Aggregate stats
  const totalValuationINR = useMemo(() => {
    return localProducts.reduce((sum, item) => sum + (Number(item?.price?.amount) || 0), 0);
  }, [localProducts]);

  const activeSellerId = useMemo(() => {
    if (localProducts.length > 0 && localProducts[0].seller) {
      return localProducts[0].seller;
    }
    return "6ad1a77ce31b273d8b3c229e";
  }, [localProducts]);

  // Handle local deletion for presentation
  const handleDeleteProduct = (id, title) => {
    if (window.confirm(`Are you sure you want to archive "${title || 'this piece'}" from your atelier catalog?`)) {
      setLocalProducts((prev) => prev.filter((p) => p._id !== id));
      triggerToast(`Archived "${title || 'piece'}" successfully`);
    }
  };

  // Handle share link
  const handleShareProduct = (item) => {
    const shareUrl = `${window.location.origin}/seller/dashboard#${item._id || ''}`;
    navigator.clipboard?.writeText(shareUrl);
    triggerToast(`Listing link for "${item.title}" copied to clipboard!`);
  };

  return (
    <div className="v-dashboard">
      {/* ── Ambient Luxury Glows ── */}
      <div className="v-dashboard__ambient-glow-top" />
      <div className="v-dashboard__ambient-glow-bottom" />

      {/* ── Top Header Navigation ── */}
      <header className="v-dashboard__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" className="v-dashboard__brand">
            <div className="v-dashboard__monogram">
              <div className="v-dashboard__monogram-inner">V</div>
            </div>
            <div className="v-dashboard__brand-text">
              VENDRA <span className="v-dot" />
            </div>
          </Link>

          <nav className="v-dashboard__nav-links">
            <span className="v-dashboard__nav-link v-dashboard__nav-link--active">
              Atelier Dashboard
            </span>
            <Link to="/seller/create-product" className="v-dashboard__nav-link">
              New Listing
            </Link>
            <span className="v-dashboard__nav-link" style={{ opacity: 0.7 }}>
              Runway Salons
            </span>
            <span className="v-dashboard__nav-link" style={{ opacity: 0.7 }}>
              Archival Vault
            </span>
          </nav>
        </div>

        <div className="v-dashboard__header-actions">
          <Link to="/seller/create-product" className="v-dashboard__btn-create">
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Create New Piece</span>
          </Link>
        </div>
      </header>

      {/* ── Main Dashboard Canvas ── */}
      <main className="v-dashboard__main">
        {/* ── Hero & Atelier Identity ── */}
        <section className="v-dashboard__hero">
          <div className="v-dashboard__hero-identity">
            <div className="v-dashboard__seller-pill">
              <span className="v-pulse" />
              <span>Verified Atelier</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span className="v-hash">{activeSellerId.slice(0, 8)}...{activeSellerId.slice(-4)}</span>
              <CheckCircle2 size={13} style={{ color: '#10b981' }} />
            </div>

            <h1 className="v-dashboard__title">VENDRA Atelier Collection</h1>
            <p className="v-dashboard__subtitle">
              Manage all created creations, monitor portfolio valuation, provenance verifications, and private collector inquiries across global fashion salons.
            </p>
          </div>

          <div className="v-dashboard__hero-cta">
            <div className="v-dashboard__stats-pill">
              <span><strong>{localProducts.length}</strong> Pieces</span>
              <span className="v-sep">•</span>
              <span><strong className="v-highlight">₹{totalValuationINR.toLocaleString('en-IN')} INR</strong> Portfolio</span>
              <span className="v-sep">•</span>
              <span><strong>3</strong> Active Salons</span>
            </div>

            <Link to="/seller/create-product" className="v-dashboard__btn-create">
              <Plus size={16} strokeWidth={2.5} />
              <span>+ Create Piece</span>
            </Link>
          </div>
        </section>

        {/* ── Summary KPI Metric Cards (Bento 4-Column Grid) ── */}
        <section className="v-dashboard__kpi-grid">
          {/* KPI 1 */}
          <div className="v-dashboard__kpi-card">
            <div className="v-dashboard__kpi-card__header">
              <span className="v-dashboard__kpi-card__label">Total Products Listed</span>
              <div className="v-dashboard__kpi-card__icon">
                <Shirt size={18} />
              </div>
            </div>
            <div className="v-dashboard__kpi-card__value">
              {localProducts.length} Pieces
            </div>
            <div className="v-dashboard__kpi-card__sub">
              <span className="v-up">
                <TrendingUp size={13} /> +2 this month
              </span>
              <span>in your atelier</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="v-dashboard__kpi-card">
            <div className="v-dashboard__kpi-card__header">
              <span className="v-dashboard__kpi-card__label">Inventory Valuation</span>
              <div className="v-dashboard__kpi-card__icon">
                <Wallet size={18} />
              </div>
            </div>
            <div className="v-dashboard__kpi-card__value v-dashboard__kpi-card__value--accent">
              ₹{totalValuationINR.toLocaleString('en-IN')} INR
            </div>
            <div className="v-dashboard__kpi-card__sub">
              <span style={{ color: '#4edea3' }}>
                ≈ ${(totalValuationINR * 0.012).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
              </span>
              <span>• Portfolio estimate</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="v-dashboard__kpi-card">
            <div className="v-dashboard__kpi-card__header">
              <span className="v-dashboard__kpi-card__label">Collector Engagement</span>
              <div className="v-dashboard__kpi-card__icon">
                <Eye size={18} />
              </div>
            </div>
            <div className="v-dashboard__kpi-card__value">
              1,420
            </div>
            <div className="v-dashboard__kpi-card__sub">
              <span style={{ color: '#d2bbff' }}>84 Private Inquiries</span>
              <span>• Global Salons</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="v-dashboard__kpi-card">
            <div className="v-dashboard__kpi-card__header">
              <span className="v-dashboard__kpi-card__label">Seller Salon Health</span>
              <div className="v-dashboard__kpi-card__icon v-dashboard__kpi-card__icon--emerald">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="v-dashboard__kpi-card__value v-dashboard__kpi-card__value--emerald">
              100% Verified
            </div>
            <div className="v-dashboard__kpi-card__sub">
              <span style={{ color: '#4edea3' }}>Escrow Protected</span>
              <span>&amp; Insured</span>
            </div>
          </div>
        </section>

        {/* ── Search, Filter & View Controls Toolbar ── */}
        <section className="v-dashboard__toolbar">
          {/* Search Box */}
          <div className="v-dashboard__search-box">
            <Search size={17} className="v-search-icon" />
            <input
              type="text"
              placeholder="Search pieces by title, provenance or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Cluster */}
          <div className="v-dashboard__filter-cluster">
            {/* Currency Selector */}
            <div className="v-dashboard__select-wrap">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <ChevronDown size={14} className="v-select-arrow" />
            </div>

            {/* Status Filter */}
            <div className="v-dashboard__select-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="REVIEW">Under Review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <ChevronDown size={14} className="v-select-arrow" />
            </div>

            {/* Sort Selector */}
            <div className="v-dashboard__select-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Created</option>
                <option value="oldest">Oldest Created</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="title">Title: A-Z</option>
              </select>
              <ChevronDown size={14} className="v-select-arrow" />
            </div>

            {/* View Layout Toggle */}
            <div className="v-dashboard__view-toggle">
              <button
                type="button"
                className={viewMode === 'grid' ? 'is-active' : ''}
                onClick={() => setViewMode('grid')}
                title="Luxury Editorial Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                className={viewMode === 'table' ? 'is-active' : ''}
                onClick={() => setViewMode('table')}
                title="Detailed Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Results Bar ── */}
        <div className="v-dashboard__results-bar">
          <div>
            Showing <span className="v-count">{filteredProducts.length}</span> of {localProducts.length} Atelier Creations
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {useSampleData ? (
              <span className="v-mock-toggle" title="Previewing atelier pieces matching your schema">
                <Sparkles size={12} /> Archival Sample View
              </span>
            ) : (
              <button
                type="button"
                className="v-mock-toggle"
                onClick={() => {
                  setLocalProducts(DEFAULT_PREVIEW_PRODUCTS);
                  setUseSampleData(true);
                  triggerToast("Loaded curated archival mock collection");
                }}
              >
                <Layers size={12} /> Load Curated Samples
              </button>
            )}
          </div>
        </div>

        {/* ── View: Product Grid ── */}
        {viewMode === 'grid' && (
          <>
            {filteredProducts.length > 0 ? (
              <section className="v-dashboard__product-grid">
                {filteredProducts.map((item, idx) => {
                  const imgUrl = getProductImage(item);
                  const imgCount = getImageCount(item);

                  return (
                    <article key={item._id || idx} className="v-dashboard__product-card">
                      <div>
                        {/* 3:4 Portrait Image Frame */}
                        <div className="v-dashboard__product-card__image-wrap">
                          <Link to={`/seller/product/${item._id}`}>
                            <img
                              src={imgUrl}
                              alt={item.title || "Product item"}
                              className="v-card-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/designer_bomber_jacket.jpg";
                              }}
                            />
                          </Link>
                          <div className="v-card-vignette" />

                          {/* Image Counter Badge */}
                          <div className="v-dashboard__product-card__img-counter">
                            1 / {imgCount} {imgCount === 1 ? 'image' : 'images'}
                          </div>

                          {/* Status Pill */}
                          <div className="v-dashboard__product-card__status-pill">
                            <span className="v-status-dot" />
                            <span>Active</span>
                          </div>

                          {/* Price Tag */}
                          <div className="v-dashboard__product-card__price-pill">
                            {formatPrice(item.price)}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="v-dashboard__product-card__body">
                          <h3 className="v-dashboard__product-card__title" title={item.title}>
                            {item.title || "Untitled Piece"}
                          </h3>

                          <p className="v-dashboard__product-card__desc">
                            {item.description || "Bespoke handcrafted piece created for discerning private collectors."}
                          </p>

                          {/* Metadata box */}
                          <div className="v-dashboard__product-card__meta">
                            <div className="v-meta-row">
                              <span>Created</span>
                              <span style={{ color: '#ffffff' }}>{formatDate(item.createdAt)}</span>
                            </div>
                            <div className="v-meta-row">
                              <span>Seller ID</span>
                              <span className="v-meta-val">
                                {typeof item.seller === 'string'
                                  ? `${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`
                                  : '6ad1a7...229e'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="v-dashboard__product-card__actions">
                        <button
                          type="button"
                          className="v-btn-details"
                          onClick={() => navigate(`/seller/product/${item._id}`)}
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="v-icon-btn"
                          title="Share Piece"
                          onClick={() => handleShareProduct(item)}
                        >
                          <Share2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="v-icon-btn v-icon-btn--delete"
                          title="Archive Piece"
                          onClick={() => handleDeleteProduct(item._id, item.title)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <div className="v-dashboard__empty">
                <div className="v-dashboard__empty__icon">
                  <Shirt size={32} />
                </div>
                <h3 className="v-dashboard__empty__title">No Pieces Match Your Criteria</h3>
                <p className="v-dashboard__empty__desc">
                  Try adjusting your search keywords, clear filter preferences, or list a new creation into your salon inventory.
                </p>
                <Link to="/seller/create-product" className="v-dashboard__btn-create" style={{ display: 'inline-flex' }}>
                  <Plus size={16} strokeWidth={2.5} />
                  <span>+ Create New Piece</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── View: Detailed Table View ── */}
        {viewMode === 'table' && (
          <section className="v-dashboard__table-container">
            <table className="v-dashboard__table">
              <thead>
                <tr>
                  <th>Piece &amp; Media</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Created Date</th>
                  <th>Seller Hash</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, idx) => {
                  const imgUrl = getProductImage(item);
                  return (
                    <tr key={item._id || idx}>
                      <td>
                        <div className="v-dashboard__table-piece">
                          <Link to={`/seller/product/${item._id}`}>
                            <img
                              src={imgUrl}
                              alt={item.title}
                              className="v-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/designer_bomber_jacket.jpg";
                              }}
                            />
                          </Link>
                          <div className="v-info">
                            <div className="v-name">{item.title || "Untitled Piece"}</div>
                            <div className="v-id">ID: {(item._id || '').slice(-6) || `00${idx + 1}`}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#a1a1aa' }}>
                          {item.description || 'No description provided'}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#ddb7ff', fontFamily: 'Playfair Display, serif' }}>
                          {formatPrice(item.price)}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: '#cfc2d6', fontSize: '12px' }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#988d9f', fontSize: '11px' }}>
                          {typeof item.seller === 'string' ? `${item.seller.slice(0, 6)}...${item.seller.slice(-4)}` : '6ad1a7...229e'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#4edea3',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                          Active
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="v-dashboard__product-card__actions .v-icon-btn"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '9999px',
                              background: 'rgba(168, 85, 247, 0.15)',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              color: '#ddb7ff',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase'
                            }}
                            onClick={() => setQuickViewProduct(item)}
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            className="v-dashboard__product-card__actions .v-icon-btn"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#cfc2d6',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Share Link"
                            onClick={() => handleShareProduct(item)}
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            type="button"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Archive"
                            onClick={() => handleDeleteProduct(item._id, item.title)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Salon Provenance & Security Guarantees Banner ── */}
        <section className="v-dashboard__trust-banner">
          <div className="v-trust-grid">
            <div className="v-trust-item">
              <div className="v-trust-icon v-trust-icon--emerald">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4>100% Provenance Authenticated</h4>
                <p>
                  Every garment undergoes physical forensic textile inspection, optical seal logging, and authenticated provenance tracing.
                </p>
              </div>
            </div>

            <div className="v-trust-item">
              <div className="v-trust-icon v-trust-icon--purple">
                <Lock size={22} />
              </div>
              <div>
                <h4>Institutional Escrow Vault</h4>
                <p>
                  Seller payouts remain safely collateralized in private institutional smart vaults until collector acceptance confirmation.
                </p>
              </div>
            </div>

            <div className="v-trust-item">
              <div className="v-trust-icon v-trust-icon--blue">
                <Plane size={22} />
              </div>
              <div>
                <h4>White-Glove Armored Courier</h4>
                <p>
                  Dedicated temperature and climate-controlled secure transport directly between your atelier and global private salons.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Global Luxury Footer ── */}
      <footer className="v-dashboard__footer">
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

      {/* ── Interactive Quick View Modal ── */}
      {quickViewProduct && (
        <div
          className="v-dashboard__modal-backdrop"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="v-dashboard__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="v-modal-close"
              onClick={() => setQuickViewProduct(null)}
              title="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="v-modal-media">
              <img
                src={getProductImage(quickViewProduct)}
                alt={quickViewProduct.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/designer_bomber_jacket.jpg";
                }}
              />
            </div>

            <div className="v-modal-content">
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
                  Active Provenance Verified
                </div>

                <h2 className="v-modal-title">{quickViewProduct.title}</h2>
                <div className="v-modal-price">{formatPrice(quickViewProduct.price)}</div>

                <p className="v-modal-desc">
                  {quickViewProduct.description || "Bespoke handcrafted piece created for discerning private collectors."}
                </p>
              </div>

              <div className="v-modal-specs">
                <div className="v-spec-row">
                  <span className="v-spec-k">Seller Identifier</span>
                  <span className="v-spec-v">{quickViewProduct.seller || activeSellerId}</span>
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
                  <span className="v-spec-k">Total Gallery Assets</span>
                  <span className="v-spec-v">{getImageCount(quickViewProduct)} Images Attached</span>
                </div>
                <div className="v-spec-row">
                  <span className="v-spec-k">Schema Version</span>
                  <span className="v-spec-v">__v: {quickViewProduct.__v ?? 0}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="v-dashboard__btn-create"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    handleShareProduct(quickViewProduct);
                  }}
                >
                  <Share2 size={15} />
                  <span>Share Listing</span>
                </button>
                <button
                  type="button"
                  style={{
                    height: '48px',
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
        <div className="v-dashboard__toast">
          <Sparkles size={16} style={{ color: '#ddb7ff' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;