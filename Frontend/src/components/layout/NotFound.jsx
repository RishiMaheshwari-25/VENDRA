import { Link } from 'react-router';
import { Compass } from 'lucide-react';

const NotFound = () => (
  <div className="container">
    <div className="empty" style={{ minHeight: '60vh', justifyContent: 'center' }}>
      <div className="empty__icon"><Compass size={26} /></div>
      <span className="eyebrow">Error 404</span>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400 }}>
        We can’t find that page
      </h1>
      <p>The link may be broken or the page may have moved.</p>
      <Link to="/search" className="btn--solid"><span>Shop all products</span></Link>
    </div>
  </div>
);

export default NotFound;
