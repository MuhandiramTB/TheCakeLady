import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/formatDate.js';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import Button from '../ui/Button.jsx';
import Toast from '../ui/Toast.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  baking: 'bg-purple-500/20 text-purple-400',
  ready: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await api('/orders/my');
      setOrders(res.data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api(`/orders/${cancelTarget.id}/cancel`, { method: 'PATCH' });
      setCancelTarget(null);
      load();
    } catch (err) { setCancelTarget(null); setToast(err.message); }
    finally { setIsCancelling(false); }
  };

  const upcoming = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const past = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  if (isLoading) return <SkeletonPage cards={3} />;

  const renderOrder = (o) => (
    <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_STYLES[o.status] || 'bg-white/10 text-white/70'}`}>
          {o.status}
        </span>
        <span className="text-xs text-white/30">#{o.id}</span>
      </div>
      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent/10 to-secondary/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl">
          {o.productImage ? <img src={o.productImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : '🎂'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{o.productName}</h3>
          <p className="text-xs text-white/60 truncate">
            {[o.size, o.flavor].filter(Boolean).join(' · ') || '—'}
          </p>
          {o.messageOnCake && <p className="text-xs text-accent mt-0.5 truncate">✏️ "{o.messageOnCake}"</p>}
        </div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 space-y-1 text-xs text-white/70 mb-3">
        <div>📅 {formatDate(o.deliveryDate)}{o.deliveryTime ? ` at ${o.deliveryTime}` : ''}</div>
        <div>{o.deliveryType === 'delivery' ? `🚚 Delivery · ${o.deliveryAddress}` : '🏠 Pickup'}</div>
        <div className="text-accent font-bold text-base pt-1">Rs. {o.totalPrice}</div>
      </div>
      {o.status === 'pending' && (
        <Button variant="danger" onClick={() => setCancelTarget(o)} className="w-full text-sm">
          Cancel Order
        </Button>
      )}
    </div>
  );

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
        <Link to="/products"><Button className="text-sm">Order More</Button></Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="🎂" title="No orders yet" description="Browse our cakes and place your first order." actionLabel="Shop Cakes" onAction={() => navigate('/products')} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-accent uppercase tracking-widest mb-4">Active</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{upcoming.map(renderOrder)}</div>
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Past</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">{past.map(renderOrder)}</div>
            </>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel Order?"
        message={cancelTarget ? `Cancel your ${cancelTarget.productName} order for ${formatDate(cancelTarget.deliveryDate)}?` : ''}
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep It"
        variant="danger"
      />
      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
