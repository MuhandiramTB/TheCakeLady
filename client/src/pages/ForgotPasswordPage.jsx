import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function ForgotPasswordPage() {
  const [info, setInfo] = useState(null);
  const [branding, setBranding] = useState({ salonName: 'SallonArt' });

  useEffect(() => {
    api('/salon-info').then((r) => setInfo(r.data)).catch(() => {});
    api('/config/branding').then((r) => setBranding(r.data)).catch(() => {});
  }, []);

  const phone = info?.phone || '';
  const whatsapp = info?.whatsapp || phone;
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi, I forgot my password for the booking app. Can you reset it?")}`
    : '';
  const telLink = phone ? `tel:${phone.replace(/\s+/g, '')}` : '';

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-white/60 text-sm mt-1">{branding.salonName}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <p className="text-white/80 text-sm mb-5">
            Contact the salon directly and we'll reset your password. You'll receive your new password on WhatsApp.
          </p>

          <div className="space-y-3">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                 className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-[#20b858] transition-colors min-h-[48px] shadow-lg shadow-green-500/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                WhatsApp Us
              </a>
            )}
            {telLink && (
              <a href={telLink}
                 className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors min-h-[48px]">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call {phone}
              </a>
            )}
            {!waLink && !telLink && (
              <p className="text-white/50 text-sm text-center py-3">
                Contact details not available. Please visit the salon in person.
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-white/60 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-accent font-semibold hover:text-accent-hover transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
