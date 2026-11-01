import { useCallback, useMemo, useRef, useState } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from './toastContext';
import '../../styles/ui.scss';

const ICONS = { success: Check, error: AlertCircle, info: Info };

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((list) => [...list.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Check;
          return (
            <div key={t.id} className={`toast toast--${t.type}`}>
              <Icon size={15} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
