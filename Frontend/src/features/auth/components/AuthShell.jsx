import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../utils/selectors';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import ProductImage from '../../../components/product/ProductImage';
import ToastProvider from '../../../components/ui/ToastProvider';
import { useProduct } from '../../products/hooks/useProduct';
import { BRAND } from '../../../config/storefront';
import { productGallery, sortNewest } from '../../../utils/product';
import '../../../styles/ui.scss';
import '../../../styles/auth.scss';

// Split-screen frame for Login / Register. The picture panel is built from real product
// photos; with no products it falls back to a plain brand panel.
const AuthShell = ({ eyebrow, title, intro, children }) => {
  const products = useSelector(selectProducts);
  const loaded = useSelector((state) => state.product?.loaded);
  const { handleGetAllProducts } = useProduct();

  useEffect(() => {
    if (!loaded) handleGetAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photos = useMemo(
    () => sortNewest(products).map((p) => productGallery(p)[0]).filter(Boolean).slice(0, 3),
    [products]
  );

  return (
    <ToastProvider>
      <div className="auth">
        <aside className="auth__art" aria-hidden={photos.length === 0 ? undefined : 'true'}>
          {photos.length > 0 && (
            <div className={`auth__photos auth__photos--${photos.length}`}>
              {photos.map((src, i) => (
                <motion.div
                  key={src}
                  className="auth__photo"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ProductImage src={src} alt="" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
          <Link to="/" className="auth__brand">{BRAND}</Link>
        </aside>

        <main className="auth__panel">
          <motion.div className="auth__card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <Link to="/" className="auth__brand auth__brand--mobile">{BRAND}</Link>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="auth__intro">{intro}</p>
            {children}
          </motion.div>
        </main>
      </div>
    </ToastProvider>
  );
};

export default AuthShell;
