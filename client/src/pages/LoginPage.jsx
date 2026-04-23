import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Button from '../ui/Button.jsx';

// Inline password field matching LoginPage's custom styling (rounded-xl, min-h-48).
function PasswordField({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[48px] ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
      >
        {visible ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        )}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branding, setBranding] = useState({ salonName: 'SallonArt' });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { api('/config/branding').then((r) => setBranding(r.data)).catch(() => {}); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: form });
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err.details) setErrors(err.details);
      else setServerError(err.message);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.salonName}
              className="w-20 h-20 rounded-full object-cover border-2 border-accent/50 bg-white/10 mx-auto mb-4 shadow-lg shadow-accent/30"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30 border-2 border-accent/50">
              <span className="text-3xl font-bold text-primary">{branding.salonName?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{branding.salonName}</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {serverError && (
            <div className="bg-error/10 border border-error/20 text-red-300 p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[48px]"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-white/70">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover transition-colors">
                  Forgot password?
                </Link>
              </div>
              <PasswordField
                name="password" value={form.password} onChange={handleChange} required
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[50px] text-base">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}
