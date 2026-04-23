import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [branding, setBranding] = useState({ salonName: 'SallonArt' });

  useEffect(() => {
    api('/config/branding').then((r) => setBranding(r.data)).catch(() => {});
  }, []);

  const homeRoute = user?.role === 'admin' ? '/admin' : '/';

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-hero relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 text-center animate-scale-in">
        {/* Big 404 with gradient */}
        <div className="text-[120px] sm:text-[160px] font-bold leading-none mb-2">
          <span className="text-gradient">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-white/70 text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to {branding.salonName}.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(homeRoute)}
            className="bg-gradient-gold text-primary font-semibold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.97] min-h-[48px]"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all min-h-[48px]"
          >
            Go Back
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-white/50 text-sm">
            Need help?{' '}
            <Link to="/services" className="text-accent hover:underline font-medium">
              Browse services
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
