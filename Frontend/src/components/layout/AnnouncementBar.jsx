import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { PROMISES } from '../../config/storefront';

const KEY = 'vendra:announce-dismissed';

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (hidden || PROMISES.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % PROMISES.length), 4000);
    return () => clearInterval(t);
  }, [hidden]);

  if (hidden || PROMISES.length === 0) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="announce">
      <div className="announce__text" aria-live="off">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {PROMISES[index].short}
          </motion.span>
        </AnimatePresence>
      </div>
      <button type="button" className="announce__x" onClick={dismiss} aria-label="Dismiss announcement">
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
