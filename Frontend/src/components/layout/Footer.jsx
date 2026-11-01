import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { BRAND, PROMISES } from '../../config/storefront';

const Footer = () => {
  const user = useSelector((state) => state.auth?.user);
  const isSeller = user?.role === 'seller';

  return (
    <footer className="foot">
      <div className="container foot__grid">
        <div className="foot__brand">
          <Link to="/" className="nav__brand">{BRAND}</Link>
          <p>Clothing and footwear from independent sellers.</p>
        </div>

        <nav className="foot__col" aria-label="Shop">
          <h4>Shop</h4>
          <Link to="/search">All products</Link>
          <Link to="/#new">New arrivals</Link>
          {!isSeller && <Link to="/cart">Your bag</Link>}
        </nav>

        <nav className="foot__col" aria-label="Account">
          <h4>Account</h4>
          {user ? (
            isSeller ? (
              <>
                <Link to="/seller/dashboard">Seller dashboard</Link>
                <Link to="/seller/create-product">Add a product</Link>
              </>
            ) : (
              <>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/orders">My orders</Link>
                <span>Signed in as {user.fullname || user.email}</span>
              </>
            )
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>

        <div className="foot__col">
          <h4>Our promise</h4>
          {PROMISES.map((p) => (
            <span key={p.key}>{p.long}</span>
          ))}
        </div>
      </div>
      <div className="container foot__base">
        <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
      </div>
      <span className="foot__mark" aria-hidden="true">{BRAND}</span>
    </footer>
  );
};

export default Footer;
