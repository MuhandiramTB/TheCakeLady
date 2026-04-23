import { useEffect, useState } from 'react';

export default function RateLimitOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail.message || 'Too many attempts. Please wait before trying again.');
      setSecondsLeft(e.detail.retryAfter || 60);
      setIsVisible(true);
    };
    window.addEventListener('rate-limit', handler);
    return () => window.removeEventListener('rate-limit', handler);
  }, []);

  useEffect(() => {
    if (!isVisible || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsVisible(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVisible, secondsLeft]);

  if (!isVisible) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1e2e]/95 backdrop-blur-sm animate-fade-in px-4">
      <div className="max-w-sm mx-auto text-center animate-scale-in">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Slow Down</h2>
        <p className="text-white/70 text-base mb-6 leading-relaxed">
          {message}
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="text-white/50 text-xs mb-1">Try again in</div>
          <div className="text-3xl font-bold text-amber-400 tabular-nums">{timeStr}</div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-sm font-medium min-h-[44px]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
