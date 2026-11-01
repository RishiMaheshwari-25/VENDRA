import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../utils/selectors';
import { Link } from 'react-router';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import ProductCard from '../../../components/product/ProductCard';
import ProductImage from '../../../components/product/ProductImage';
import Reveal, { Stagger } from '../../../components/ui/Reveal';
import { EASE } from '../../../components/ui/motion';
import { HERO, PROMISES } from '../../../config/storefront';
import { SORTS, formatPrice, productGallery, sortNewest, stockStatus } from '../../../utils/product';
import '../../../styles/home.scss';
import '../../../styles/product-card.scss';

const SLIDE_MS = 6500;

const wordVariants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

const Hero = ({ slides, isSeller }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, slides.length, paused]);

  const current = slides[index];
  const image = current ? productGallery(current)[0] : null;
  const words = HERO.title.split(' ');

  return (
    <section
      className={`hero ${current ? '' : 'hero--plain'}`}
      ref={stageRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {current && (
        <div className="hero__bg" aria-hidden="true">
          <motion.div className="hero__parallax" style={{ y: parallax }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={current._id}
                className="hero__slide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1 }}
              >
                <motion.div
                  className="hero__kenburns"
                  initial={{ scale: 1.14 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
                >
                  <ProductImage src={image} alt="" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div className="hero__shade" />
        </div>
      )}

      <div className="container hero__inner">
        <motion.div className="hero__copy" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
          <motion.span className="eyebrow hero__eyebrow" variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}>
            {HERO.eyebrow}
          </motion.span>

          <h1 className="hero__title" aria-label={HERO.title}>
            {words.map((w, i) => (
              <span key={i} aria-hidden="true">
                <span className="hero__word">
                  <motion.span variants={wordVariants} className={i === words.length - 1 ? 'hero__accent' : ''}>{w}</motion.span>
                </span>{' '}
              </span>
            ))}
          </h1>

          <motion.p className="hero__text" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}>
            {HERO.text}
          </motion.p>

          <motion.div className="hero__actions" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}>
            <Link to="/#new" className="btn--solid">
              <span>{HERO.cta}</span> <ArrowRight size={15} />
            </Link>
            {isSeller && (
              <Link to="/seller/create-product" className="btn--outline">Add a product</Link>
            )}
          </motion.div>
        </motion.div>

        {current && (
          <Link to={`/product/${current._id}`} className="hero__caption">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <strong>{current.title}</strong>
                <span>{formatPrice(current.price)}</span>
              </motion.div>
            </AnimatePresence>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {current && slides.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Featured products">
          {slides.map((s, i) => (
            <button
              key={s._id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${s.title}`}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            >
              {i === index && !paused && (
                <motion.i key={`${index}-bar`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }} />
              )}
              {i === index && paused && <i style={{ transform: 'scaleX(1)' }} />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

const Home = () => {
  const products = useSelector(selectProducts);
  const loaded = useSelector((state) => state.product?.loaded);
  const user = useSelector((state) => state.auth?.user);
  const isSeller = user?.role === 'seller';

  const [sort, setSort] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cols, setCols] = useState(4);
  const railRef = useRef(null);

  const newest = useMemo(() => sortNewest(products), [products]);
  const slides = useMemo(() => newest.filter((p) => productGallery(p).length > 0).slice(0, 4), [newest]);
  const rail = newest.slice(0, 8);
  const spotlight = useMemo(() => newest.find((p) => productGallery(p).length > 1) || null, [newest]);

  const grid = useMemo(() => {
    const list = inStockOnly ? products.filter((p) => ['in', 'low'].includes(stockStatus(p))) : products;
    return [...list].sort(SORTS[sort].fn);
  }, [products, sort, inStockOnly]);

  const scrollRail = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const spotImgs = spotlight ? productGallery(spotlight) : [];

  return (
    <div className="home">
      <Hero slides={slides} isSeller={isSeller} />

      {/* Ticker */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((n) => (
            <div className="ticker__group" key={n}>
              {[...PROMISES, ...PROMISES].map((p, i) => (
                <span key={`${p.key}-${i}`}>
                  {p.short}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {!loaded ? (
        <section className="container section">
          <div className="pgrid pgrid--4 pgrid--skeleton">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} />)}
          </div>
        </section>
      ) : products.length === 0 ? (
        <section className="container section">
          <div className="empty">
            <div className="empty__icon"><Shirt size={26} /></div>
            <h2>The store is getting ready</h2>
            <p>No products have been listed yet. Check back soon for new arrivals.</p>
            {isSeller && <Link to="/seller/create-product" className="btn--solid"><span>List the first product</span></Link>}
          </div>
        </section>
      ) : (
        <>
          {/* New arrivals rail */}
          <section id="new" className="section">
            <div className="container">
              <div className="section-head">
                <Reveal>
                  <span className="eyebrow">Just landed</span>
                  <h2>New arrivals</h2>
                </Reveal>
                <div className="rail__nav">
                  <button type="button" onClick={() => scrollRail(-1)} aria-label="Scroll left"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => scrollRail(1)} aria-label="Scroll right"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
            <Stagger className="rail" gap={0.08}>
              <div className="rail__track" ref={railRef}>
                {rail.map((p) => (
                  <div className="rail__item" key={p._id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </Stagger>
          </section>

          {/* Spotlight */}
          {spotlight && (
            <section className="container section spot">
              <div className="spot__grid">
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <motion.div
                    className="spot__media"
                    variants={{
                      hidden: { clipPath: 'inset(0 100% 0 0)' },
                      show: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.1, ease: EASE } },
                    }}
                  >
                    <Link to={`/product/${spotlight._id}`} aria-label={spotlight.title}>
                      <ProductImage src={spotImgs[0]} alt={spotlight.title} />
                    </Link>
                    <ProductImage src={spotImgs[1]} alt="" className="spot__alt" />
                  </motion.div>
                </motion.div>

                <Reveal className="spot__copy" delay={0.2}>
                  <span className="eyebrow">Spotlight</span>
                  <h2>{spotlight.title}</h2>
                  <p>{spotlight.description}</p>
                  <strong className="spot__price">{formatPrice(spotlight.price)}</strong>
                  <Link to={`/product/${spotlight._id}`} className="btn--solid">
                    <span>View product</span> <ArrowRight size={15} />
                  </Link>
                </Reveal>
              </div>
            </section>
          )}

          {/* Shop all */}
          <section id="shop" className="container section">
            <div className="section-head">
              <Reveal>
                <span className="eyebrow">The collection</span>
                <h2>Shop all</h2>
              </Reveal>
            </div>

            <div className="controls">
              <p className="controls__count" aria-live="polite">{grid.length} {grid.length === 1 ? 'product' : 'products'}</p>
              <label className="controls__check">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                <span>In stock only</span>
              </label>
              <div className="controls__cols" role="group" aria-label="Grid size">
                {[3, 4].map((n) => (
                  <button key={n} type="button" className={cols === n ? 'is-on' : ''} aria-pressed={cols === n} onClick={() => setCols(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <label className="controls__sort">
                <span className="sr-only">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                </select>
              </label>
            </div>

            {grid.length > 0 ? (
              <Stagger key={`${sort}-${inStockOnly}`} className={`pgrid ${cols === 4 ? 'pgrid--4' : ''}`} gap={0.05}>
                {grid.map((p) => <ProductCard key={p._id} product={p} />)}
              </Stagger>
            ) : (
              <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3>Nothing in stock right now</h3>
                <p>Every product is currently sold out. Turn off the filter to see everything.</p>
                <button type="button" className="btn--outline" onClick={() => setInStockOnly(false)}>Show all products</button>
              </motion.div>
            )}
          </section>

          {/* Seller call to action (real routes only) */}
          {user?.role !== 'buyer' && (
            <motion.section className="band">
              <Reveal className="container band__inner">
                <h2>{isSeller ? 'Add something new to the store' : 'Sell on Vendra'}</h2>
                <Link to={isSeller ? '/seller/create-product' : '/register'} className="link-arrow">
                  {isSeller ? 'Add a product' : 'Create a seller account'} <ArrowRight size={14} />
                </Link>
              </Reveal>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
