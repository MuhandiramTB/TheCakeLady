import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { getTodayDate, getNextDays } from '../lib/formatDate.js';
import Spinner from '../ui/Spinner.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const split = (csv) => (csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : []);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [storeInfo, setStoreInfo] = useState({ leadTimeDays: 2, pickupEnabled: 1, deliveryEnabled: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [size, setSize] = useState('');
  const [flavor, setFlavor] = useState('');
  const [messageOnCake, setMessageOnCake] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    Promise.all([
      api(`/products/${id}`).catch(() => ({ data: null })),
      api('/store-info').catch(() => ({ data: null })),
    ])
      .then(([p, s]) => {
        setProduct(p.data);
        if (s.data) setStoreInfo(s.data);
        const defaults = p.data ? {
          size: split(p.data.sizeOptions)[0] || '',
          flavor: split(p.data.flavorOptions)[0] || '',
        } : {};
        setSize(defaults.size || '');
        setFlavor(defaults.flavor || '');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <Spinner />;
  if (!product) return <p className="text-center text-red-400 py-12">Cake not found.</p>;

  const sizes = split(product.sizeOptions);
  const flavors = split(product.flavorOptions);

  // Available delivery dates: today + leadTime → +30 days
  const allDates = getNextDays(30);
  const leadTime = storeInfo.leadTimeDays || 2;
  const availableDates = allDates.slice(leadTime);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/products/${id}`));
      return;
    }
    if (!deliveryDate) { setError('Please choose a delivery date'); return; }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please provide a delivery address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: {
          productId: product.id,
          size, flavor, messageOnCake,
          totalPrice: product.basePrice, // price could scale by size in future
          deliveryDate,
          deliveryTime,
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : '',
          customerNote,
        },
      });
      navigate('/order-success', { state: { order: res.data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto animate-fade-in">
      <Link to="/products" className="text-accent text-sm hover:underline mb-4 inline-flex items-center gap-1">
        ← Back to cakes
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="aspect-square bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-40">🎂</div>
          )}
        </div>

        <div>
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">{product.categoryName}</p>
          <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>
          {product.description && <p className="text-white/70 mb-5">{product.description}</p>}
          <p className="text-3xl font-bold text-accent mb-2">Rs. {product.basePrice}</p>
          <p className="text-xs text-white/50 mb-6">Starting price — final varies by size & customization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Customize your cake</h2>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

        {sizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                    size === s ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {flavors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Flavor</label>
            <div className="flex flex-wrap gap-2">
              {flavors.map((f) => (
                <button key={f} type="button" onClick={() => setFlavor(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                    flavor === f ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Message on cake (optional)</label>
          <Input value={messageOnCake} onChange={(e) => setMessageOnCake(e.target.value)} placeholder="e.g. Happy Birthday Nimal!" maxLength={80} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Delivery date</label>
            <select value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required
              className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 [&>option]:bg-[#2a1b22]">
              <option value="">Pick a date</option>
              {availableDates.map((d) => <option key={d} value={d}>{new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</option>)}
            </select>
            <p className="text-xs text-white/50 mt-1">Earliest available is {leadTime} days from today</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Time (optional)</label>
            <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 [color-scheme:dark]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Pickup or delivery?</label>
          <div className="flex gap-2">
            {storeInfo.pickupEnabled ? (
              <button type="button" onClick={() => setDeliveryType('pickup')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  deliveryType === 'pickup' ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}>🏠 Pickup</button>
            ) : null}
            {storeInfo.deliveryEnabled ? (
              <button type="button" onClick={() => setDeliveryType('delivery')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  deliveryType === 'delivery' ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}>🚚 Delivery</button>
            ) : null}
          </div>
        </div>

        {deliveryType === 'delivery' && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Delivery address</label>
            <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required
              rows={3} placeholder="Full address with landmarks"
              className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Special instructions (optional)</label>
          <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)}
            rows={2} placeholder="e.g. No nuts, gluten-free, specific decoration requests..."
            className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50" />
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70">Total</span>
            <span className="text-2xl font-bold text-accent">Rs. {product.basePrice}</span>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[52px] text-base">
            {user ? 'Place Order' : 'Sign in to Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
