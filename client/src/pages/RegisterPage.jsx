import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Button from '../ui/Button.jsx';

function PasswordField({ fieldClass = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${fieldClass} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
      >
        {visible ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        )}
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
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
      const res = await api('/auth/register', { method: 'POST', body: form });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      if (err.details) setErrors(err.details);
      else setServerError(err.message);
    } finally { setIsSubmitting(false); }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[44px] ${errors[field] ? 'border-red-400/50' : 'border-white/10'}`;

  return (
    <div className="h-[calc(100vh-57px)] flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 animate-scale-in">
        <div className="text-center mb-5">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.salonName}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent/50 bg-white/10 mx-auto mb-3 shadow-lg shadow-accent/30"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/30 border-2 border-accent/50">
              <span className="text-2xl font-bold text-primary">{branding.salonName?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{branding.salonName}</h1>
          <p className="text-white/60 text-xs mt-1">Create your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {serverError && (
            <div className="bg-error/10 border border-error/20 text-red-300 p-3 rounded-xl mb-4 text-xs font-medium animate-slide-up">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter your name" className={inputClass('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className={inputClass('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Mobile Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="07X XXX XXXX" className={inputClass('phone')} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Password</label>
              <PasswordField name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" fieldClass={inputClass('password')} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[46px] text-sm mt-1">
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/60 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:text-accent-hover">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
