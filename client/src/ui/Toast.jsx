import { useEffect } from 'react';

const styles = {
  error: 'bg-error text-white',
  success: 'bg-success text-white',
  info: 'bg-primary text-white',
};

const icons = {
  error: '!',
  success: '\u2713',
  info: 'i',
};

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[320px] ${styles[type]} px-5 py-3.5 rounded-xl shadow-xl z-50 animate-toast-enter`}
    >
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {icons[type]}
        </span>
        <span className="text-[15px] font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-xl ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
