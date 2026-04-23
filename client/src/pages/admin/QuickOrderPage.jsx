import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getNextDays, formatDate } from '../../lib/formatDate.js';
import { openWhatsApp } from '../../lib/whatsapp.js';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

const split = (csv) => (csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : []);

export default function QuickOrderPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState({ leadTimeDays: 2 });
  const [storeName, setStoreName] = useState('our bakery');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [productId, setProductId] = useState('');
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
      api('/products').catch(() => ({ data: [] })),
      api('/store-info').catch(() => ({ data: null })),
      api('/config/branding').catch(() => ({ data: null })),
    ])
      .then(([p, s, b]) => {
        setProducts(p.data || []);
        if (s.data) setStoreInfo(s.data);
        if (b.data?.salonName) setStoreName(b.data.salonName);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selected = products.find((p) => p.id === Number(productId));
  const sizes = selected ? split(selected.sizeOptions) : [];
  const flavors = selected ? split(selected.flavorOptions) : [];

  useEffect(() => {
    if (selected) {
      setSize(sizes[0] || '');
      setFlavor(flavors[0] || '');
    }
  }, [productId]);

  const dates = getNextDays(30).slice(storeInfo.leadTimeDays || 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customer.name || !customer.phone || !productId || !deliveryDate) {
      setError('Please fill all required fields');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError('Delivery address is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api('/admin/orders', {
        method: 'POST',
        body: {
          customerName: customer.name,
          customerPhone: customer.phone,
          productId: Number(productId),
          size, flavor, messageOnCake,
          totalPrice: selected.basePrice,
          deliveryDate, deliveryTime,
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : '',
          customerNote,
          status: 'confirmed',
        },
      });
      setSuccess(res.data);
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const sendReminder = () => {
    if (!success?.customerPhone) return;
    const msg =
      `Hi ${success.customerName} 🎂\n\n` +
      `Your order at *${storeName}* is confirmed!\n\n` +
      `📋 ${success.productName}${success.size ? ` · ${success.size}` : ''}${success.flavor ? ` · ${success.flavor}` : ''}\n` +
      (success.messageOnCake ? `✏️ "${success.messageOnCake}"\n` : '') +
      `📅 ${formatDate(success.deliveryDate)}${success.deliveryTime ? ` at ${success.deliveryTime}` : ''}\n` +
      `${success.deliveryType === 'delivery' ? '🚚 ' + success.deliveryAddress : '🏠 Pickup'}\n` +
      `💰 Rs. ${success.totalPrice}\n\n` +
      `See you then!`;
    openWhatsApp(success.customerPhone, msg);
  };

  if (isLoading) return <Spinner />;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 animate-scale-in">
        <Card className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Order Created & Confirmed!</h2>
          <p className="text-white/60 text-sm mb-4">Send the customer a reminder on WhatsApp:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
            <div className="flex justify-between"><span className="text-white/70">Customer</span><span className="text-white">{success.customerName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Phone</span><span className="text-accent">{success.customerPhone}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Cake</span><span className="text-white">{success.productName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Delivery</span><span className="text-white">{formatDate(success.deliveryDate)}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Total</span><span className="text-accent font-bold">Rs. {success.totalPrice}</span></div>
          </div>
          {success.customerPhone && (
            <button onClick={sendReminder}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-[#20b858] min-h-[48px] mb-3">
              Send Reminder on WhatsApp
            </button>
          )}
          <div className="flex gap-3">
            <Button onClick={() => { setSuccess(null); setCustomer({ name: '', phone: '' }); setProductId(''); setDeliveryDate(''); }} className="flex-1">New Order</Button>
            <Button variant="secondary" onClick={() => navigate('/admin/orders')} className="flex-1">View Orders</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-2">Quick Order</h1>
      <p className="text-white/70 mb-6 text-sm">Create an order for a walk-in or phone customer.</p>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Card className="mb-5">
          <h2 className="font-semibold text-white mb-4">Customer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="Customer Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required />
            <Input label="Mobile Number" type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+94 77 123 4567" required />
          </div>
        </Card>

        <Card className="mb-5">
          <h2 className="font-semibold text-white mb-4">Cake</h2>
          <Select label="Select a cake" value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Choose a cake</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} — Rs. {p.basePrice}</option>)}
          </Select>
          {selected && (
            <>
              {sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/70 mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button key={s} type="button" onClick={() => setSize(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[40px] ${size === s ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {flavors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/70 mb-2">Flavor</label>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((f) => (
                      <button key={f} type="button" onClick={() => setFlavor(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[40px] ${flavor === f ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}>{f}</button>
                    ))}
                  </div>
                </div>
              )}
              <Input label="Message on cake (optional)" value={messageOnCake} onChange={(e) => setMessageOnCake(e.target.value)} maxLength={80} />
            </>
          )}
        </Card>

        {selected && (
          <Card className="mb-5">
            <h2 className="font-semibold text-white mb-4">Delivery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Date</label>
                <select value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required
                  className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 [&>option]:bg-[#2a1b22]">
                  <option value="">Pick a date</option>
                  {dates.map((d) => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Time</label>
                <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 [color-scheme:dark]" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeliveryType('pickup')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] ${deliveryType === 'pickup' ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10'}`}>🏠 Pickup</button>
                <button type="button" onClick={() => setDeliveryType('delivery')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] ${deliveryType === 'delivery' ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 border border-white/10'}`}>🚚 Delivery</button>
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-white/70 mb-2">Delivery address</label>
                <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required rows={2}
                  className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50" />
              </div>
            )}
            <Input label="Notes (optional)" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
          </Card>
        )}

        {selected && customer.name && customer.phone && deliveryDate && (
          <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[52px]">
            Create Order for {customer.name} — Rs. {selected.basePrice}
          </Button>
        )}
      </form>
    </div>
  );
}
