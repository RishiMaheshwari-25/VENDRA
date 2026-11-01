import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router';
import { MotionConfig, motion } from 'motion/react';
import ToastProvider from '../ui/ToastProvider';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchOverlay from '../../features/search/SearchOverlay';
import { useProduct } from '../../features/products/hooks/useProduct';
import { useCart } from '../../features/cart/hooks/useCart';
import { useWishlist } from '../../features/wishlist/hooks/useWishlist';
import '../../styles/ui.scss';
import '../../styles/layout.scss';

const Layout = () => {
  const { pathname, hash } = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const loaded = useSelector((state) => state.product?.loaded);
  const { handleGetAllProducts } = useProduct();
  const { handleGetItems } = useCart();
  const { handleGetWishlist } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);

  // Catalogue is needed by Home, Search and Product pages — load it once for the shell.
  useEffect(() => {
    if (!loaded) handleGetAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the bag count current for signed-in shoppers.
  useEffect(() => {
    if (user && user.role !== 'seller') handleGetItems().catch(() => {});
  }, [user, handleGetItems]);

  // ...and which products they have saved, so every heart shows the right state.
  useEffect(() => {
    if (user && user.role !== 'seller') handleGetWishlist().catch(() => {});
  }, [user, handleGetWishlist]);

  // New page -> top; /#section -> that section.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <div className="shell">
          <AnnouncementBar />
          <Navbar onSearch={openSearch} />
          <motion.main
            key={pathname}
            className="shell__main"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.main>
          <Footer />
        </div>
        <SearchOverlay open={searchOpen} onClose={closeSearch} />
      </ToastProvider>
    </MotionConfig>
  );
};

export default Layout;
