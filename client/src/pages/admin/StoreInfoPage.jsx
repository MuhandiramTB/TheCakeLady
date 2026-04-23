import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

const INITIAL = {
  storeName: '', logoUrl: '', ownerName: '',
  phone: '', whatsapp: '', email: '', address: '',
  googleMapsUrl: '', facebookUrl: '', instagramUrl: '',
  leadTimeDays: 2, deliveryEnabled: 1, pickupEnabled: 1,
  orderNote: '',
};

const CC = '+94';
const stripCC = (val = '') => {
  let s = String(val).trim();
  if (s.startsWith(CC)) s = s.slice(CC.length);
  else if (s.startsWith('94')) s = s.slice(2);
  s = s.replace(/^\s+/, '');
  if (s.startsWith('0')) s = s.slice(1);
  return s;
};
const addCC = (val = '') => {
  let s = String(val).trim();
  if (!s) return '';
  if (s.startsWith('+')) return s;
  if (s.startsWith('0')) s = s.slice(1);
  return `${CC} ${s}`;
};
const toWaLink = (val = '') => {
  const d = String(val).replace(/[^0-9]/g, '');
  return d ? `https://wa.me/${d}` : '';
};

function PhoneInput({ label, value, onChange, placeholder, showWaTest = false }) {
  const local = stripCC(value);
  const digits = String(value || '').replace(/[^0-9]/g, '');
  const isValid = digits.length >= 11 && digits.length <= 13;
  const showError = local.length > 0 && !isValid;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <div className="flex">
        <span className="inline-flex items-center px-3.5 bg-white/10 border border-white/10 border-r-0 rounded-l-lg text-white/80 font-mono text-sm select-none">{CC}</span>
        <input
          type="tel"
          inputMode="numeric"
          value={local}
          onChange={(e) => onChange(addCC(e.target.value.replace(/[^0-9\s]/g, '')))}
          placeholder={placeholder}
          className={`flex-1 w-full px-4 py-2.5 border rounded-r-lg text-[15px] min-h-[44px] bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-white/20 ${showError ? 'border-red-500/50' : 'border-white/10'}`}
        />
      </div>
      {showError && <p className="text-red-400 text-xs mt-1.5">9 digits, no leading 0. Example: 77 123 4567</p>}
      {showWaTest && isValid && local.length > 0 && (
        <a href={toWaLink(value)} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-green-400 hover:underline mt-1.5">
          💬 Test this number on WhatsApp
        </a>
      )}
    </div>
  );
}

function LogoUpload({ value, onChange }) {
  const [error, setError] = useState('');
  const MAX = 200 * 1024;
  const handle = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Pick an image file.'); return; }
    if (file.size > MAX) { setError(`Image too large (${Math.round(file.size / 1024)} KB). Max 200 KB.`); return; }
    const r = new FileReader();
    r.onload = (e) => onChange(e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1.5">Logo</label>
      {value && (
        <div className="flex items-center gap-3 mb-2 p-3 bg-white/5 border border-white/10 rounded-lg">
          <img src={value} alt="logo" className="w-16 h-16 rounded-full object-cover border-2 border-accent/40 bg-white/10"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="flex-1 text-xs text-white/80">{value.startsWith('data:') ? 'Uploaded image' : value}</div>
          <button type="button" onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10">Remove</button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 cursor-pointer min-h-[40px]">
        🎨 {value ? 'Replace Logo' : 'Upload Logo'}
        <input type="file" accept="image/*" onChange={(e) => handle(e.target.files?.[0])} className="hidden" />
      </label>
      <p className="text-xs text-white/50 mt-1.5">Max 200 KB. Square images look best.</p>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default function StoreInfoPage() {
  const [form, setForm] = useState(INITIAL);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api('/store-info');
      if (res.data) setForm({ ...INITIAL, ...res.data });
    } finally { setIsLoading(false); }
  };

  const ch = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const chPhone = (field) => (v) => setForm({ ...form, [field]: v });
  const chBool = (field) => (e) => setForm({ ...form, [field]: e.target.checked ? 1 : 0 });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await api('/store-info', { method: 'PUT', body: form });
      setMessage('Saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="py-6 animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Store Info</h1>
        <p className="text-sm text-white/60 mt-1">Branding + contact details shown to customers.</p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up ${
          message.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
        }`}>{message}</div>
      )}

      <form onSubmit={handleSave}>
        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-2">Branding</h3>
          <p className="text-xs text-white/60 mb-4">Name + logo shown on navbar, login page, WhatsApp messages.</p>
          <Input label="Store Name" value={form.storeName} onChange={ch('storeName')} placeholder="e.g. TheCakeLady" />
          <LogoUpload value={form.logoUrl} onChange={(val) => setForm((f) => ({ ...f, logoUrl: val }))} />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Contact</h3>
          <Input label="Owner Name" value={form.ownerName} onChange={ch('ownerName')} placeholder="e.g. Nirasha Silva" />
          <PhoneInput label="Phone" value={form.phone} onChange={chPhone('phone')} placeholder="77 123 4567" />
          <PhoneInput label="WhatsApp Number" value={form.whatsapp} onChange={chPhone('whatsapp')} placeholder="77 123 4567" showWaTest />
          <Input label="Email" type="email" value={form.email} onChange={ch('email')} placeholder="hello@thecakelady.lk" />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Location</h3>
          <Input label="Address" value={form.address} onChange={ch('address')} placeholder="e.g. 12 Galle Rd, Colombo 04" />
          <Input label="Google Maps Link" value={form.googleMapsUrl} onChange={ch('googleMapsUrl')} placeholder="https://maps.google.com/..." />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Social (optional)</h3>
          <Input label="Facebook URL" value={form.facebookUrl} onChange={ch('facebookUrl')} placeholder="https://facebook.com/..." />
          <Input label="Instagram URL" value={form.instagramUrl} onChange={ch('instagramUrl')} placeholder="https://instagram.com/..." />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Delivery Settings</h3>
          <Input label="Lead time (days)" type="number" min="0" value={form.leadTimeDays} onChange={ch('leadTimeDays')} />
          <p className="text-xs text-white/50 mt-[-0.75rem] mb-4">Customers can't pick a delivery date earlier than this many days from today.</p>

          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
              <input type="checkbox" checked={!!form.pickupEnabled} onChange={chBool('pickupEnabled')}
                className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent/50" />
              🏠 Allow pickup
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
              <input type="checkbox" checked={!!form.deliveryEnabled} onChange={chBool('deliveryEnabled')}
                className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent/50" />
              🚚 Allow delivery
            </label>
          </div>
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-2">Order Note</h3>
          <p className="text-xs text-white/60 mb-3">Message shown to customers after they order.</p>
          <textarea value={form.orderNote} onChange={ch('orderNote')} rows={3}
            placeholder="e.g. For custom designs, please WhatsApp us with a reference photo."
            className="w-full px-4 py-2.5 border border-white/10 rounded-lg text-[15px] bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </Card>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
