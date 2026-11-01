import { useState } from 'react';
import { BRAND } from '../../config/storefront';

// <img> that falls back to a neutral placeholder instead of a fake product photo.
const ProductImage = ({ src, alt = '', className, ...rest }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="img-fallback" role="img" aria-label={alt}>
        {BRAND.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} {...rest} />;
};

export default ProductImage;
