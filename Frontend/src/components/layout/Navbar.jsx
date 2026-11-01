import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, LayoutDashboard, Menu, PackageCheck, Search, ShoppingBag, User, X } from 'lucide-react';
import { BRAND } from '../../config/storefront';

const Navbar = ({ onSearch }) => {
  const user = useSelector((state) => state.auth?.user);
  const authLoading = useSelector((state) => state.auth?.loading);
  const cartItems = useSelector((state) => state.cart?.items);
  const wishCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const isSeller = user?.role === 'seller';
  const bagCount = useMemo(
    () => (Array.isArray(cartItems) ? cartItems.reduce((n, it) => n + (Number(it?.quantity) || 1), 0) : 0),
    [cartItems]
  );
  const firstName = (user?.fullname || user?.email || '').split(/[\s@]/)[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__inner">
        <button type="button" className="nav__icon nav__burger" onClick={() => setDrawer(true)} aria-label="Open menu">
          <Menu size={21} />
        </button>

        <nav className="nav__links" aria-label="Main">
          <NavLink to="/search" className="nav__link">Shop</NavLink>
          <Link to="/#new" className="nav__link">New arrivals</Link>
        </nav>

        <Link to="/" className="nav__brand" aria-label={`${BRAND} home`}>{BRAND}</Link>

        <div className="nav__actions">
          <button type="button" className="nav__icon nav__search" onClick={onSearch} aria-label="Search">
            <Search size={19} />
            <span className="nav__search-label">Search</span>
          </button>

          {!authLoading && (user ? (
            <span className="nav__user"><User size={16} /> {firstName}</span>
          ) : (
            <Link to="/login" className="nav__link nav__signin">Sign in</Link>
          ))}

          {isSeller && (
            <Link to="/seller/dashboard" className="nav__icon nav__dash" aria-label="Seller dashboard" title="Seller dashboard">
              <LayoutDashboard size={19} />
            </Link>
          )}

          {!isSeller && (
            <Link to="/wishlist" className="nav__icon nav__wish" aria-label={`Wishlist, ${wishCount} items`} title="Wishlist">
              <Heart size={19} />
              {wishCount > 0 && (
                <motion.span
                  key={wishCount}
                  className="nav__badge"
                  initial={{ scale: 1.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                >
                  {wishCount}
                </motion.span>
              )}
            </Link>
          )}

          {user && !isSeller && (
            <Link to="/orders" className="nav__icon nav__orders" aria-label="My orders" title="My orders">
              <PackageCheck size={19} />
              <span className="nav__search-label">Orders</span>
            </Link>
          )}

          {!isSeller && (
            <Link to="/cart" className="nav__icon nav__bag" aria-label={`Bag, ${bagCount} items`} data-bag-icon>
              <ShoppingBag size={20} />
              {bagCount > 0 && (
                <motion.span
                  key={bagCount}
                  className="nav__badge"
                  initial={{ scale: 1.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                >
                  {bagCount}
                </motion.span>
              )}
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="drawer__scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Menu"
            >
              <div className="drawer__top">
                <span className="nav__brand">{BRAND}</span>
                <button type="button" className="nav__icon" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={21} /></button>
              </div>

              <button type="button" className="drawer__search" onClick={() => { setDrawer(false); onSearch(); }}>
                <Search size={17} /> Search products
              </button>

              <motion.ul
                className="drawer__links"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
              >
                {[
                  { to: '/search', label: 'Shop' },
                  { to: '/#new', label: 'New arrivals' },
                  ...(isSeller ? [{ to: '/seller/dashboard', label: 'Seller dashboard' }, { to: '/seller/create-product', label: 'Add a product' }] : [{ to: '/cart', label: `Bag${bagCount ? ` (${bagCount})` : ''}` }, { to: '/wishlist', label: `Wishlist${wishCount ? ` (${wishCount})` : ''}` }, ...(user ? [{ to: '/orders', label: 'My orders' }] : [])]),
                  ...(!user && !authLoading ? [{ to: '/login', label: 'Sign in' }, { to: '/register', label: 'Create account' }] : []),
                ].map((l) => (
                  <motion.li key={l.to} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                    <Link to={l.to} onClick={() => setDrawer(false)}>{l.label}</Link>
                  </motion.li>
                ))}
              </motion.ul>

              {user && <p className="drawer__who"><User size={15} /> Signed in as {user.fullname || user.email}</p>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
