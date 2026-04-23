import { useEffect, useState } from 'react';

export default function ServerWakingOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => setIsVisible(e.detail.waking);
    window.addEventListener('server-waking', handler);
    return () => window.removeEventListener('server-waking', handler);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1e2e]/95 backdrop-blur-sm animate-fade-in">
      <div className="text-center max-w-sm mx-auto px-6">
        {/* Animated loader */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>
          <div className="absolute inset-3 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Waking up the server...</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          Our server takes a moment to wake up after being idle.
          This takes about 30 seconds — just a moment please.
        </p>

        <div className="flex items-center justify-center gap-1 text-white/40 text-xs">
          <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          <span>Please don't refresh</span>
        </div>
      </div>
    </div>
  );
}
