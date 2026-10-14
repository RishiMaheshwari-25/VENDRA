import React, { useState } from 'react';
import { useAuth } from '../hooks/auth.hook';
import { useNavigate, Link } from 'react-router';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import '../../../styles/register.scss';

const Register = () => {
  const { handleRegister, loading, error: authError } = useAuth();
  const navigate=useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  async function handleGoogleRegister(){
      window.location.href = "/api/auth/google";
    }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (localError) setLocalError('');
  };

  const handleCheckboxToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isSeller: !prev.isSeller
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!formData.fullname.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }
    if (!formData.contact.trim()) {
      setLocalError('Please enter your contact number');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      await handleRegister({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password,
        isSeller: formData.isSeller
      });
      navigate("/"); 
      setSuccessMsg('Account created successfully!');
    } catch (err) {
      // Error handled by useAuth or displayed via local error
      setLocalError(err?.response?.data?.message || err?.message || 'Failed to create account');
    }
  
  };

  return (
    <div className="register-page">
      {/* ============================================================ */}
      {/* LEFT HALF: Branded 3D Mobile Showcase with Ambient Rings    */}
      {/* ============================================================ */}
      <section className="hero-side">
        {/* Ambient Glow & Concentric Rings */}
        <div className="ambient-glow-core" />
        <div className="concentric-ring ring-1" />
        <div className="concentric-ring ring-2" />
        <div className="concentric-ring ring-3" />

        {/* Top Header */}
        <header className="hero-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <span>V</span>
            </div>
            <span className="logo-text">VENDRA</span>
          </div>
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>Next-Gen Marketplace</span>
          </div>
        </header>

        {/* Center 3D Showcase (Floating Tilted Phones with Majestic Clothes) */}
        <div className="hero-showcase">
          {/* Ambient Spotlight */}
          <div className="showcase-spotlight" />

          {/* Floating Glass Badge (Top Left) */}
          <div className="floating-badge badge-top">
            <ShieldCheck size={14} className="badge-icon-verified" />
            <span>100% Verified Haute Couture</span>
          </div>

          {/* Phone 1: Back Tilted Phone (Cyber Designer Bomber Jacket) */}
          <div className="phone-back">
            <div className="phone-notch" />
            <div className="phone-mini-header">
              <span className="brand-tag">STREETWEAR ATELIER</span>
              <span className="live-pill">TRENDING</span>
            </div>

            <div className="phone-product-card">
              <div className="image-wrapper">
                <img
                  src="/images/designer_bomber_jacket.jpg"
                  alt="Cyber Neon Silk Bomber Jacket"
                  className="product-img"
                />
                <span className="rarity-tag">LIMITED PIECE</span>
              </div>
              <div className="product-details">
                <div className="title-row">
                  <span className="product-title">Cyber Silk Bomber</span>
                  <span className="product-price">$890</span>
                </div>
                <div className="meta-row">
                  <span className="rating-tag">★ 4.98 (84 orders)</span>
                  <span className="status-badge">In Vault</span>
                </div>
              </div>
            </div>

            <div className="mini-bid-bar">
              <div className="bid-info">
                <span className="bid-label">CURATED CREATOR</span>
                <span className="bid-val">Obsidian Atelier</span>
              </div>
              <span className="view-btn">View Item</span>
            </div>
          </div>

          {/* Phone 2: Front Tilted Phone (Majestic Imperial Velvet Cape Gown) */}
          <div className="phone-front">
            <div className="phone-notch" />

            <div className="phone-user-bar">
              <div className="user-left">
                <div className="avatar-dot">V</div>
                <span className="username">VENDRA COUTURE</span>
              </div>
              <div className="search-pill">
                <Sparkles size={9} />
                <span>FW26 DROP</span>
              </div>
            </div>

            {/* Majestic Couture Product Card */}
            <div className="phone-product-card featured">
              <div className="image-wrapper featured-img-wrap">
                <img
                  src="/images/couture_purple_apparel.jpg"
                  alt="Majestic Imperial Velvet Haute Couture"
                  className="product-img"
                />
                <div className="overlay-badge">1 OF 5 WORLDWIDE</div>
                <div className="product-price-overlay">
                  <div className="price-label">IMPERIAL VELVET CAPE</div>
                  <div className="price-amount">$4,850</div>
                </div>
              </div>

              {/* Action Bar inside Phone */}
              <div className="action-row">
                <div className="collector-info">
                  <span className="collector-sub">AUTHENTICATED COUTURE</span>
                  <span className="collector-time">Live Vault Piece</span>
                </div>
                <button type="button" className="btn-acquire">
                  <span>Acquire</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Mini Escrow / Security Bar */}
            <div className="phone-footer-bar">
              <div className="secure-badge">
                <ShieldCheck size={11} className="secure-icon" />
                <span>Verified Provenance & Escrow Protected</span>
              </div>
            </div>
          </div>

          {/* Floating Glass Badge (Bottom Right) */}
          <div className="floating-badge badge-bottom">
            <TrendingUp size={14} className="badge-icon-trend" />
            <div className="badge-col">
              <span className="badge-micro">CURATED VOLUME</span>
              <span className="badge-strong">$3.8M+ Apparel Traded</span>
            </div>
          </div>
        </div>

        {/* Bottom Headline & Tagline */}
        <footer className="hero-footer">
          <h2>Curated Luxury Fashion & Exclusive Drops</h2>
          <p>Discover, trade, and showcase majestic couture and designer apparel with verified global authenticity.</p>
        </footer>
      </section>

      {/* ============================================================ */}
      {/* RIGHT HALF: Minimal Obsidian Registration Form (Full View)   */}
      {/* ============================================================ */}
      <section className="form-side">
        <div className="corner-glow" />

        <div className="form-wrapper">
          {/* Header */}
          <div className="form-header">
            <div className="brand-eyebrow">
              <Sparkles size={13} />
              <span>Join Vendra Today</span>
            </div>
            <h1>Let's Get Started</h1>
            <p>Create your credentials to join our buyer & seller network.</p>
          </div>

          {/* Error / Success Notifications */}
          {(localError || authError) && (
            <div className="alert-box alert-error">
              <span>{localError || authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success">
              <ShieldCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="register-form" onSubmit={handleSubmit} noValidate>
            {/* 1. Full Name */}
            <div className="input-field">
              <label htmlFor="fullname">Full Name</label>
              <div className="pill-input-container">
                <span className="input-icon-left">
                  <User size={16} />
                </span>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div className="input-field">
              <label htmlFor="email">Email Address</label>
              <div className="pill-input-container">
                <span className="input-icon-left">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="surya@xyz.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* 3. Contact Number */}
            <div className="input-field">
              <label htmlFor="contact">Contact Number</label>
              <div className="pill-input-container">
                <span className="input-icon-left">
                  <Phone size={16} />
                </span>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={formData.contact}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* 4. Password */}
            <div className="input-field">
              <label htmlFor="password">Password</label>
              <div className="pill-input-container">
                <span className="input-icon-left">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="icon-btn-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 5. isSeller Flag Checkbox */}
            <div
              className={`seller-checkbox-container ${formData.isSeller ? 'checked' : ''}`}
              onClick={handleCheckboxToggle}
            >
              <input
                type="checkbox"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
              />
              <div className="custom-checkbox-box">
                <Check size={12} className="check-icon" strokeWidth={3} />
              </div>
              <div className="checkbox-labels">
                <span className="label-title">
                  Register as Seller
                  <span className="seller-badge">Seller Hub</span>
                </span>
                <span className="label-desc">
                  Access merchant inventory tools, store analytics, and direct payouts.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Direct Redirect */}
          <p className="redirect-text">
            Already have an account?
            <Link to="/login" className="signin-link">
              Sign In
            </Link>
          </p>

          {/* Social Auth Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Continue with Google Button */}
          <button onClick={handleGoogleRegister}type="button" className="btn-google">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                fill="#EA4335"
              />
              <path
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                fill="#4285F4"
              />
              <path
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                fill="#FBBC05"
              />
              <path
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
                fill="#34A853"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Register;