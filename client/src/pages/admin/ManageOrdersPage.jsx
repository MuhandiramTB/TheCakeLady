import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getTodayDate, formatDate } from '../../lib/formatDate.js';
import { openWhatsApp, waTemplates } from '../../lib/whatsapp.js';
import Card from '../../ui/Card.jsx';
import Button from '../../ui/Button.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import Spinner from '../../ui/Spinner.jsx';

const STATUSES = ['pending', 'confirmed', 'baking', 'ready', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  baking: 'bg-purple-500/20 text-purple-400',
  ready: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_ACTIONS = {
  confirm: { next: 'confirmed', title: 'Confirm Order?', message: 'Mark this order as confirmed.', confirmLabel: 'Yes, Confirm', variant: 'warning' },
  start: { next: 'baking', title: 'Start Baking?', message: 'Mark this order as baking.', confirmLabel: 'Yes, Start', variant: 'warning' },
  ready: { next: 'ready', title: 'Ready for Pickup/Delivery?', message: 'Mark this order as ready.', confirmLabel: 'Yes, Ready', variant: 'warning' },
  deliver: { next: 'delivered', title: 'Mark as Delivered?', message: 'Mark this order as delivered/completed.', confirmLabel: 'Yes, Delivered', variant: 'warning' },
  cancel: { next: 'cancelled', title: 'Cancel Order?', message: 'This cancels the order. Cannot be undone.', confirmLabel: 'Yes, Cancel', variant: 'danger' },
};

// WhatsApp templates tailored to cake orders
function buildCakeMsg(kind, o, storeName, appUrl) {
  const items = [o.productName, o.size, o.flavor].filter(Boolean).join(' · ');
  const when = `${formatDate(o.deliveryDate)}${o.deliveryTime ? ' at ' + o.deliveryTime : ''}`;
  const where = o.deliveryType === 'delivery' ? `🚚 Delivery to ${o.deliveryAddress || '—'}` : '🏠 Pickup';
  const link = appUrl ? `\n\n🔗 ${appUrl}/my-orders` : '';
  switch (kind) {
    case 'confirm':
      return `Hi ${o.customerName} 👋\n\nYour order at *${storeName}* is *CONFIRMED*! ✅\n\n🎂 ${items}\n📅 ${when}\n${where}\n💰 Rs. ${o.totalPrice}\n\nSee you then!` + link;
    case 'baking':
      return `Hi ${o.customerName} 🧁\n\nWe've started baking your *${o.productName}*! It'll be ready on ${formatDate(o.deliveryDate)}.` + link;
    case 'ready':
      return `Hi ${o.customerName} 🎉\n\nYour *${o.productName}* is ready!\n\n${where === '🏠 Pickup' ? 'Please collect at your convenience.' : 'We\'ll deliver it as planned.'}` + link;
    case 'reminder':
      return `Hi ${o.customerName},\n\nReminder: your *${o.productName}* order is on ${when}.\n${where}`;
    case 'cancel':
      return `Hi ${o.customerName},\n\nYour order at *${storeName}* has been cancelled:\n\n🎂 ${o.productName}\n📅 ${when}\n\nPlease contact us to rebook. Sorry for the inconvenience.`;
    default:
      return '';
  }
}

export default function ManageOrdersPage() {
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || '';
  const urlDate = searchParams.get('delivery_date') || '';

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(urlDate === 'today' ? getTodayDate() : (urlDate || getTodayDate()));
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  const [isDailyView, setIsDailyView] = useState(urlStatus && !urlDate ? false : true);
  const [actionTarget, setActionTarget] = useState(null);
  const [isActioning, setIsActioning] = useState(false);
  const [toast, setToast] = useState(null);
  const [storeName, setStoreName] = useState('our bakery');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-asc');
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (isDailyView && filterDate) params.set('delivery_date', filterDate);
      if (filterStatus) params.set('status', filterStatus);
      const res = await api(`/admin/orders?${params}`);
      setOrders(res.data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, [filterDate, filterStatus, isDailyView]);
  useEffect(() => {
    api('/config/branding').then((r) => setStoreName(r.data?.salonName || 'our bakery')).catch(() => {});
  }, []);

  const showError = (msg) => setToast({ message: msg, type: 'error' });
  const showSuccess = (msg) => setToast({ message: msg, type: 'success' });

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsActioning(true);
    try {
      const { next } = STATUS_ACTIONS[actionTarget.action];
      await api(`/admin/orders/${actionTarget.order.id}`, { method: 'PATCH', body: { status: next } });
      setActionTarget(null);
      load();
      showSuccess(`Order ${next}`);
    } catch (err) {
      setActionTarget(null);
      showError(err.message);
    } finally { setIsActioning(false); }
  };

  // One-click: open WhatsApp THEN update status (popup blocker safe)
  const progressAndNotify = (o, next, waKind) => {
    if (o.customerPhone && waKind) {
      const msg = buildCakeMsg(waKind, o, storeName, window.location.origin);
      openWhatsApp(o.customerPhone, msg);
    }
    api(`/admin/orders/${o.id}`, { method: 'PATCH', body: { status: next } })
      .then(() => { showSuccess(`Order ${next}`); load(); })
      .catch((err) => showError(err.message));
  };

  const sendReminder = (o) => {
    if (!o.customerPhone) { showError('No customer phone on file.'); return; }
    const msg = buildCakeMsg('reminder', o, storeName, window.location.origin);
    openWhatsApp(o.customerPhone, msg);
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.toLowerCase().includes(q) ||
      o.productName?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const dtA = `${a.deliveryDate} ${a.deliveryTime || '00:00'}`;
    const dtB = `${b.deliveryDate} ${b.deliveryTime || '00:00'}`;
    switch (sortBy) {
      case 'date-asc': return dtA.localeCompare(dtB);
      case 'date-desc': return dtB.localeCompare(dtA);
      case 'created-desc': return (b.id || 0) - (a.id || 0);
      case 'price-desc': return (b.totalPrice || 0) - (a.totalPrice || 0);
      default: return 0;
    }
  });

  const hasActiveFilters = search || sortBy !== 'date-asc';

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-3">{isDailyView ? `Orders for ${formatDate(filterDate)}` : 'All Orders'}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none border border-white/10 bg-[#2a1b22] text-white rounded-lg px-2 sm:px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 [&>option]:bg-[#2a1b22]">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={() => setIsDailyView(!isDailyView)}
            className="border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg px-3 py-2 min-h-[40px] text-sm font-medium flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="hidden sm:inline">{isDailyView ? 'Show All' : 'Daily View'}</span>
            <span className="sm:hidden">{isDailyView ? 'All' : 'Daily'}</span>
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`border rounded-lg px-3 py-2 min-h-[40px] text-sm font-medium flex items-center gap-1.5 flex-shrink-0 ${
              hasActiveFilters ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="hidden sm:inline">Filter & Sort</span>
            <span className="sm:hidden">Filter</span>
            {hasActiveFilters && <span>•</span>}
          </button>
        </div>
        {isDailyView && (
          <div className="mt-2">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-auto border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 [color-scheme:dark]" />
          </div>
        )}
      </div>

      {showFilters && (
        <Card className="mb-5 !p-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Search</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, or cake"
                className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 [&>option]:bg-[#2a1b22]">
                <option value="date-asc">Delivery date (soonest)</option>
                <option value="date-desc">Delivery date (latest)</option>
                <option value="created-desc">Newest orders first</option>
                <option value="price-desc">Price (high to low)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? <Spinner /> : sorted.length === 0 ? (
        <EmptyState icon="🎂" title="No orders found" description="Try different filters or check back later." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((o) => (
            <Card key={o.id} className="!p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                <span className="text-xs text-white/30">#{o.id}</span>
              </div>
              <div className="flex gap-3 mb-2">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent/10 to-secondary/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                  {o.productImage ? <img src={o.productImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : '🎂'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{o.productName}</h3>
                  <p className="text-xs text-white/60 truncate">{[o.size, o.flavor].filter(Boolean).join(' · ')}</p>
                  {o.messageOnCake && <p className="text-xs text-accent truncate">✏️ "{o.messageOnCake}"</p>}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 space-y-1 text-xs text-white/70 mb-2">
                <div>👤 {o.customerName}</div>
                {o.customerPhone && <a href={`tel:${o.customerPhone.replace(/\s+/g, '')}`} className="block text-accent hover:underline">📞 {o.customerPhone}</a>}
                <div>📅 {formatDate(o.deliveryDate)}{o.deliveryTime ? ` · ${o.deliveryTime}` : ''}</div>
                <div>{o.deliveryType === 'delivery' ? `🚚 ${o.deliveryAddress || 'Delivery'}` : '🏠 Pickup'}</div>
                <div className="text-accent font-bold pt-1">Rs. {o.totalPrice}</div>
              </div>

              {/* Action row — status-aware */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                {o.status === 'pending' && (
                  <button onClick={() => progressAndNotify(o, 'confirmed', 'confirm')}
                    className="flex-1 min-w-0 text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-2 rounded-lg min-h-[36px] flex items-center justify-center gap-1.5">
                    <WA /> <span className="truncate">Confirm</span>
                  </button>
                )}
                {o.status === 'confirmed' && (
                  <button onClick={() => progressAndNotify(o, 'baking', 'baking')}
                    className="flex-1 min-w-0 text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 px-3 py-2 rounded-lg min-h-[36px] flex items-center justify-center gap-1.5">
                    <WA /> <span className="truncate">Start Baking</span>
                  </button>
                )}
                {o.status === 'baking' && (
                  <button onClick={() => progressAndNotify(o, 'ready', 'ready')}
                    className="flex-1 min-w-0 text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 px-3 py-2 rounded-lg min-h-[36px] flex items-center justify-center gap-1.5">
                    <WA /> <span className="truncate">Ready</span>
                  </button>
                )}
                {o.status === 'ready' && (
                  <button onClick={() => setActionTarget({ action: 'deliver', order: o })}
                    className="flex-1 min-w-0 text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-2 rounded-lg min-h-[36px] flex items-center justify-center gap-1.5">
                    <span className="truncate">Mark Delivered</span>
                  </button>
                )}
                {!['delivered', 'cancelled'].includes(o.status) && (
                  <>
                    {o.customerPhone && (
                      <button onClick={() => sendReminder(o)}
                        className="w-10 h-10 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30" title="Send reminder">
                        <WA />
                      </button>
                    )}
                    <button onClick={() => setActionTarget({ action: 'cancel', order: o })}
                      className="w-10 h-10 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30" title="Cancel">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        isLoading={isActioning}
        title={actionTarget ? STATUS_ACTIONS[actionTarget.action].title : ''}
        message={actionTarget ? STATUS_ACTIONS[actionTarget.action].message : ''}
        confirmLabel={actionTarget ? STATUS_ACTIONS[actionTarget.action].confirmLabel : 'Confirm'}
        cancelLabel="Go Back"
        variant={actionTarget ? STATUS_ACTIONS[actionTarget.action].variant : 'warning'}
      />
      {toast && <Toast message={toast.message} type={toast.type || 'error'} onClose={() => setToast(null)} />}
    </div>
  );
}

function WA() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
  );
}
