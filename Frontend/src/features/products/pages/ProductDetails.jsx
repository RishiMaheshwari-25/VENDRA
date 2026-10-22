import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  X,
  Check,
  Heart,
  Sparkles
} from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import '../../../styles/product-details.scss';

const getAttributeEntries = (attributes) => {
  if (!attributes) return [];
  return attributes instanceof Map ? [...attributes.entries()] : Object.entries(attributes);
};

const getImageUrls = (images = []) =>
  images.map((image) => (typeof image === 'string' ? image : image?.url)).filter(Boolean);

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { handleGetProductDetail } = useProduct();

  useEffect(() => {
    let isCurrentProduct = true;

    const fetchProductDetail = async () => {
      const data = await handleGetProductDetail(productId);
      if (!isCurrentProduct) return;
      setProduct(data);
      const firstVariant = data?.variants?.[0];
      if (firstVariant?.attributes) {
        setSelectedAttributes(Object.fromEntries(getAttributeEntries(firstVariant.attributes)));
      }
      setActiveImg(0);
    };

    fetchProductDetail();
    return () => {
      isCurrentProduct = false;
    };
  }, [productId, handleGetProductDetail]);

  const variants = product?.variants || [];
  const variantAttributes = variants.map((variant) =>
    Object.fromEntries(getAttributeEntries(variant.attributes))
  );

  const attributeGroups = variantAttributes.reduce((groups, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (!groups[key]) groups[key] = new Set();
      groups[key].add(value);
    });
    return groups;
  }, {});

  // Identify color/tone and size keys
  const colorKey = Object.keys(attributeGroups).find((k) =>
    /^(color|colour|shade|tone|pattern)$/i.test(k)
  ) || null;

  const sizeKey = Object.keys(attributeGroups).find((k) =>
    /^(size|dimension)$/i.test(k)
  ) || null;

  const otherAttributeKeys = Object.keys(attributeGroups).filter(
    (k) => k !== colorKey && k !== sizeKey
  );

  // Exact match index
  const selectedVariantIndex = variantAttributes.findIndex((attributes) =>
    Object.keys(attributeGroups).length > 0 &&
    Object.keys(attributeGroups).every((key) => attributes[key] === selectedAttributes[key])
  );

  // Best-effort match if not all attributes are matched simultaneously
  const bestVariantIndex = selectedVariantIndex >= 0
    ? selectedVariantIndex
    : variantAttributes.findIndex((attributes) =>
        colorKey ? attributes[colorKey] === selectedAttributes[colorKey] : true
      );

  const selectedVariant = selectedVariantIndex >= 0
    ? variants[selectedVariantIndex]
    : (bestVariantIndex >= 0 ? variants[bestVariantIndex] : (variants[0] || null));

  const productImages = getImageUrls(product?.images);
  const variantImages = getImageUrls(selectedVariant?.images);
  const images = variantImages.length > 0
    ? variantImages
    : (productImages.length > 0 ? productImages : ['/images/designer_bomber_jacket.jpg']);

  const displayedPrice = selectedVariant?.price || product?.price;
  const selectedColor = colorKey ? selectedAttributes[colorKey] : null;

  // Build color swatches for the "MORE COLORS" gallery grid
  const colorSwatches = (() => {
    if (!colorKey) return [];
    const uniqueColors = [...(attributeGroups[colorKey] || [])];
    return uniqueColors.map((col) => {
      const matchingVariant = variants.find((v) => {
        const attrs = Object.fromEntries(getAttributeEntries(v.attributes));
        return attrs[colorKey] === col && getImageUrls(v.images).length > 0;
      }) || variants.find((v) => {
        const attrs = Object.fromEntries(getAttributeEntries(v.attributes));
        return attrs[colorKey] === col;
      });

      const swatchImg = getImageUrls(matchingVariant?.images)[0] || productImages[0];
      return {
        value: col,
        variant: matchingVariant,
        image: swatchImg,
      };
    });
  })();

  const selectAttribute = (attributeKey, value) => {
    setSelectedAttributes((current) => {
      const otherSelections = Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== attributeKey)
      );

      // Try finding variant that preserves existing other selections
      let matching = variantAttributes.find((attributes) => {
        return attributes[attributeKey] === value &&
          Object.entries(otherSelections).every(([k, v]) => attributes[k] === v);
      });

      // Otherwise pick any variant that has this attribute value
      if (!matching) {
        matching = variantAttributes.find((attributes) => attributes[attributeKey] === value);
      }

      return matching ? matching : { ...otherSelections, [attributeKey]: value };
    });
    setActiveImg(0);
  };

  const selectVariant = (variant) => {
    if (!variant) return;
    const attrs = Object.fromEntries(getAttributeEntries(variant.attributes));
    setSelectedAttributes(attrs);
    setActiveImg(0);
  };

  const goPrev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveImg((i) => (i + 1) % images.length);

  const formatPrice = (price) => {
    if (!price || typeof price.amount === 'undefined') return '';
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[price.currency] || '₹';
    return `${symbol}${Number(price.amount).toLocaleString(price.currency === 'INR' ? 'en-IN' : undefined)}`;
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return '';
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const sym = symbols[currency] || '₹';
    return `${sym}${Number(amount).toLocaleString(currency === 'INR' ? 'en-IN' : undefined)}`;
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 2800);
  };

  const baseAmount = Number(displayedPrice?.amount) || 0;
  const calculatedMrp = displayedPrice?.mrp || (baseAmount > 0 ? Math.round(baseAmount * 2.85) : null);
  const discountPercent = calculatedMrp && calculatedMrp > baseAmount
    ? Math.round(((calculatedMrp - baseAmount) / calculatedMrp) * 100)
    : 65;

  return (
    <div className="v-pd">
      <header className="v-pd__header">
        <Link to="/" className="v-pd__brand">VENDRA</Link>
        <Link to="/" className="v-pd__back">
          <ArrowLeft size={14} />
          <span>Back to catalog</span>
        </Link>
      </header>

      <main className="v-pd__main">
        {!product ? (
          <div className="v-pd__loading">
            <div className="v-pd__skeleton v-pd__skeleton--media" />
            <div className="v-pd__skeleton-col">
              <div className="v-pd__skeleton v-pd__skeleton--line" style={{ width: '30%' }} />
              <div className="v-pd__skeleton v-pd__skeleton--title" />
              <div className="v-pd__skeleton v-pd__skeleton--line" style={{ width: '25%' }} />
              <div className="v-pd__skeleton v-pd__skeleton--line" />
              <div className="v-pd__skeleton v-pd__skeleton--line" />
            </div>
          </div>
        ) : (
          <section className="v-pd__layout">
            {/* Gallery */}
            <div className="v-pd__gallery">
              <div className="v-pd__stage">
                {images[activeImg] && (
                  <img
                    src={images[activeImg]}
                    alt={product.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/designer_bomber_jacket.jpg';
                    }}
                  />
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="v-pd__arrow v-pd__arrow--prev"
                      aria-label="Previous image"
                      onClick={goPrev}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="v-pd__arrow v-pd__arrow--next"
                      aria-label="Next image"
                      onClick={goNext}
                    >
                      <ChevronRight size={20} />
                    </button>
                    <span className="v-pd__counter">
                      {activeImg + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="v-pd__thumbs">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`v-pd__thumb ${activeImg === i ? 'is-active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${product.title} view ${i + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/designer_bomber_jacket.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Variants Column */}
            <div className="v-pd__info">
              <div className="v-pd__meta-row">
                <span className="v-pd__eyebrow">Haute Couture Collection</span>
                <button
                  type="button"
                  className={`v-pd__wishlist-btn ${isWishlisted ? 'is-active' : ''}`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    triggerToast(!isWishlisted ? 'Saved to your private vault' : 'Removed from vault');
                  }}
                >
                  <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
                </button>
              </div>

              <h1 className="v-pd__title">{product.title}</h1>

              {/* Price, MRP & Discount (Matching user screenshot) */}
              <div className="v-pd__pricing-card">
                <div className="v-pd__price-row">
                  <span className="v-pd__price-current">{formatPrice(displayedPrice)}</span>
                  {calculatedMrp && (
                    <>
                      <span className="v-pd__price-mrp">
                        MRP {formatCurrency(calculatedMrp, displayedPrice?.currency)}
                      </span>
                      <span className="v-pd__price-discount">
                        ({discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <div className="v-pd__tax">inclusive of all taxes</div>
              </div>

              <div className="v-pd__divider" />

              {/* ── MORE COLORS / VARIANTS GRID (Matching user screenshot) ── */}
              {colorSwatches.length > 0 && (
                <section className="v-pd__swatches-section" aria-label="Available Colors">
                  <div className="v-pd__section-header">
                    <h3 className="v-pd__section-title">
                      MORE COLORS
                      {colorSwatches.length > 1 && (
                        <span className="v-pd__section-count"> ({colorSwatches.length})</span>
                      )}
                    </h3>
                    {selectedColor && (
                      <span className="v-pd__selected-indicator">
                        Selected: <strong>{selectedColor}</strong>
                      </span>
                    )}
                  </div>

                  <div className="v-pd__color-grid">
                    {colorSwatches.map((swatch, idx) => {
                      const isSelected = selectedColor === swatch.value;
                      return (
                        <button
                          type="button"
                          key={swatch.value || idx}
                          className={`v-pd__color-swatch ${isSelected ? 'is-selected' : ''}`}
                          aria-pressed={isSelected}
                          aria-label={`Select color ${swatch.value}`}
                          onClick={() => selectAttribute(colorKey, swatch.value)}
                        >
                          <div className="v-pd__color-thumb">
                            <img
                              src={swatch.image || productImages[0] || '/images/designer_bomber_jacket.jpg'}
                              alt={swatch.value}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/designer_bomber_jacket.jpg';
                              }}
                            />
                            <span className="v-pd__color-tooltip">{swatch.value}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* If no colorKey, but variants exist with images */}
              {!colorKey && variants.length > 0 && (
                <section className="v-pd__swatches-section" aria-label="Available Variants">
                  <div className="v-pd__section-header">
                    <h3 className="v-pd__section-title">
                      MORE OPTIONS / VARIANTS
                      <span className="v-pd__section-count"> ({variants.length})</span>
                    </h3>
                  </div>

                  <div className="v-pd__color-grid">
                    {variants.map((v, idx) => {
                      const isSelected = idx === selectedVariantIndex;
                      const vImgs = getImageUrls(v.images);
                      const vAttrs = variantAttributes[idx];
                      const label = Object.entries(vAttrs).map(([k, val]) => `${k}: ${val}`).join(', ') || `Option ${idx + 1}`;
                      const swatchImg = vImgs[0] || productImages[0] || '/images/designer_bomber_jacket.jpg';

                      return (
                        <button
                          type="button"
                          key={v._id || idx}
                          className={`v-pd__color-swatch ${isSelected ? 'is-selected' : ''}`}
                          aria-pressed={isSelected}
                          aria-label={`Select ${label}`}
                          onClick={() => selectVariant(v)}
                        >
                          <div className="v-pd__color-thumb">
                            <img
                              src={swatchImg}
                              alt={label}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/designer_bomber_jacket.jpg';
                              }}
                            />
                            <span className="v-pd__color-tooltip">{label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── SELECT SIZE with SIZE CHART (Matching user screenshot) ── */}
              {sizeKey && (
                <section className="v-pd__size-section" aria-label="Select Size">
                  <div className="v-pd__size-header">
                    <h3 className="v-pd__section-title">SELECT SIZE</h3>
                    <button
                      type="button"
                      className="v-pd__size-chart-btn"
                      onClick={() => setShowSizeChart(true)}
                    >
                      <span>SIZE CHART</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="v-pd__size-options">
                    {[...attributeGroups[sizeKey]].map((sizeVal) => {
                      const isSelected = selectedAttributes[sizeKey] === sizeVal;
                      const variantForThisSize = variantAttributes.findIndex((attrs) => {
                        return attrs[sizeKey] === sizeVal &&
                          (!colorKey || attrs[colorKey] === selectedColor);
                      });
                      const isOutOfStock = variantForThisSize >= 0 && Number(variants[variantForThisSize]?.stock) <= 0;

                      return (
                        <button
                          type="button"
                          key={sizeVal}
                          className={`v-pd__size-pill ${isSelected ? 'is-selected' : ''} ${isOutOfStock ? 'is-out-of-stock' : ''}`}
                          aria-pressed={isSelected}
                          disabled={isOutOfStock}
                          onClick={() => selectAttribute(sizeKey, sizeVal)}
                        >
                          <span>{sizeVal}</span>
                          {isOutOfStock && <span className="v-pd__size-strike" />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── OTHER ATTRIBUTES (if any, like Fit, Material, etc.) ── */}
              {otherAttributeKeys.map((key) => (
                <div className="v-pd__other-attr-section" key={key}>
                  <div className="v-pd__section-header">
                    <h3 className="v-pd__section-title">{key.toUpperCase()}</h3>
                    <span className="v-pd__selected-indicator">{selectedAttributes[key] || 'Select'}</span>
                  </div>
                  <div className="v-pd__attr-options">
                    {[...attributeGroups[key]].map((val) => {
                      const isSelected = selectedAttributes[key] === val;
                      return (
                        <button
                          type="button"
                          key={val}
                          className={`v-pd__attr-pill ${isSelected ? 'is-selected' : ''}`}
                          aria-pressed={isSelected}
                          onClick={() => selectAttribute(key, val)}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Stock availability */}
              {selectedVariant && (
                <div className="v-pd__stock-box">
                  <span className={`v-pd__stock-pulse ${Number(selectedVariant.stock) > 0 ? 'is-in' : 'is-out'}`} />
                  <span className="v-pd__stock-label">
                    {Number(selectedVariant.stock) > 5
                      ? 'In Stock'
                      : Number(selectedVariant.stock) > 0
                      ? `Hurry, only ${selectedVariant.stock} left in stock!`
                      : 'Out of Stock for selected combination'}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="v-pd__desc-wrap">
                <h2 className="v-pd__label">Description</h2>
                <p className="v-pd__desc">{product.description}</p>
              </div>

              {/* Primary Actions */}
              <div className="v-pd__actions">
                <button
                  type="button"
                  className="v-pd__btn v-pd__btn--solid"
                  onClick={() => triggerToast(`Added "${product.title}" to your archival bag`)}
                >
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </button>
                <button
                  type="button"
                  className="v-pd__btn v-pd__btn--outline"
                  onClick={() => triggerToast(`Proceeding to checkout with "${product.title}"`)}
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Atelier Trust Perks */}
              <ul className="v-pd__perks">
                <li><Truck size={16} /><span>Free shipping on every order</span></li>
                <li><RotateCcw size={16} /><span>Easy 7-day returns</span></li>
                <li><ShieldCheck size={16} /><span>100% authentic product verified</span></li>
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* ── Size Chart Modal ── */}
      {showSizeChart && (
        <div className="v-pd__modal-overlay" onClick={() => setShowSizeChart(false)}>
          <div className="v-pd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="v-pd__modal-header">
              <div>
                <h2 className="v-pd__modal-title">Size Chart &amp; Fit Guide</h2>
                <p className="v-pd__modal-sub">All measurements in inches (cm in parentheses)</p>
              </div>
              <button
                type="button"
                className="v-pd__modal-close"
                onClick={() => setShowSizeChart(false)}
                aria-label="Close Size Chart"
              >
                <X size={20} />
              </button>
            </div>
            <div className="v-pd__modal-body">
              <table className="v-pd__size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Front Length</th>
                    <th>Shoulder</th>
                    <th>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>S</strong></td>
                    <td>38 in (96.5 cm)</td>
                    <td>27.5 in (70 cm)</td>
                    <td>16.5 in (42 cm)</td>
                    <td>8.0 in (20.3 cm)</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong></td>
                    <td>40 in (101.6 cm)</td>
                    <td>28.5 in (72.4 cm)</td>
                    <td>17.5 in (44.5 cm)</td>
                    <td>8.5 in (21.6 cm)</td>
                  </tr>
                  <tr>
                    <td><strong>L</strong></td>
                    <td>42 in (106.7 cm)</td>
                    <td>29.5 in (74.9 cm)</td>
                    <td>18.5 in (47 cm)</td>
                    <td>9.0 in (22.9 cm)</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong></td>
                    <td>44 in (111.8 cm)</td>
                    <td>30.5 in (77.5 cm)</td>
                    <td>19.5 in (49.5 cm)</td>
                    <td>9.5 in (24.1 cm)</td>
                  </tr>
                  <tr>
                    <td><strong>XXL</strong></td>
                    <td>46 in (116.8 cm)</td>
                    <td>31.5 in (80 cm)</td>
                    <td>20.5 in (52 cm)</td>
                    <td>10.0 in (25.4 cm)</td>
                  </tr>
                </tbody>
              </table>
              <div className="v-pd__size-tip">
                <strong>Fit Note:</strong> Designed for an elegant, comfortable regular fit. If you prefer a relaxed or oversized drape, choose one size up.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="v-pd__toast">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
