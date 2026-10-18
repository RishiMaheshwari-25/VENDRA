import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import '../../../styles/product-details.scss';


const ProductDetails = () => {
const {productId}=useParams();
console.log(productId);
const [product,setProduct]=useState(null);
const [activeImg,setActiveImg]=useState(0);
const {handleGetProductDetail}=useProduct();
async function fetchProductDetaill(){
    const data=await handleGetProductDetail(productId);
    setProduct(data);
}
useEffect(()=>{
fetchProductDetaill()
},[productId])
console.log(product);

  const images = (product?.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);

  const goPrev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveImg((i) => (i + 1) % images.length);

  const formatPrice =(price) => {
    if (!price || typeof price.amount === 'undefined') return '';
    const symbols = { INR: '₹', USD: '$', EUR: '€' };
    const symbol = symbols[price.currency] || '';
    return `${symbol}${Number(price.amount).toLocaleString(price.currency === 'INR' ? 'en-IN' : undefined)} ${price.currency || ''}`.trim();
  };

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
                  <img src={images[activeImg]} alt={product.title} />
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
                    >
                      <img src={url} alt={`${product.title} view ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="v-pd__info">
              <span className="v-pd__eyebrow">New Arrival</span>
              <h1 className="v-pd__title">{product.title}</h1>
              <div className="v-pd__price">{formatPrice(product.price)}</div>
              <span className="v-pd__tax">Inclusive of all taxes</span>

              <div className="v-pd__divider" />

              <h2 className="v-pd__label">Description</h2>
              <p className="v-pd__desc">{product.description}</p>

              <div className="v-pd__actions">
                <button type="button" className="v-pd__btn v-pd__btn--outline">
                  <ShoppingBag size={15} />
                  <span>Add to Cart</span>
                </button>
                <button type="button" className="v-pd__btn v-pd__btn--solid">
                  <span>Buy Now</span>
                </button>
              </div>

              <ul className="v-pd__perks">
                <li><Truck size={16} /><span>Free shipping on every order</span></li>
                <li><RotateCcw size={16} /><span>Easy 7-day returns</span></li>
                <li><ShieldCheck size={16} /><span>100% authentic product</span></li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default ProductDetails
