import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getTodayDate, formatDate, formatTime } from '../../lib/formatDate.js';
import Card from '../../ui/Card.jsx';
import Button from '../../ui/Button.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  baking: 'bg-purple-500/20 text-purple-400',
  ready: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/admin/stats'),
      api(`/admin/orders?delivery_date=${getTodayDate()}`),
    ])
      .then(([s, o]) => { setStats(s.data); setTodayOrders(o.data); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <Link to="/admin/quick-order"><Button className="text-sm">+ Quick Order</Button></Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Link to="/admin/users" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-accent">{stats.customers}</div>
              <div className="text-xs text-white/60 mt-1">Customers</div>
            </Card>
          </Link>
          <Link to="/admin/products" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-white">{stats.products}</div>
              <div className="text-xs text-white/60 mt-1">Cakes</div>
            </Card>
          </Link>
          <Link to="/admin/orders" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-blue-400">{stats.orders.total}</div>
              <div className="text-xs text-white/60 mt-1">Total Orders</div>
            </Card>
          </Link>
          <Link to="/admin/orders?status=delivered" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-green-400">{stats.orders.delivered}</div>
              <div className="text-xs text-white/60 mt-1">Delivered</div>
            </Card>
          </Link>
        </div>
      )}

      <h2 className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Today's Deliveries</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link to="/admin/orders?delivery_date=today" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-white">{todayOrders.filter((o) => o.status !== 'cancelled').length}</div>
            <div className="text-xs text-white/60 mt-1">Due Today</div>
          </Card>
        </Link>
        <Link to="/admin/orders?status=pending" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-amber-400">{stats?.orders?.pending || 0}</div>
            <div className="text-xs text-white/60 mt-1">Pending</div>
          </Card>
        </Link>
        <Link to="/admin/orders?status=baking" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-purple-400">{stats?.orders?.baking || 0}</div>
            <div className="text-xs text-white/60 mt-1">Baking</div>
          </Card>
        </Link>
      </div>

      {todayOrders.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-3xl mb-3">🎂</div>
          <p className="text-white/70">No orders due today</p>
          <p className="text-white/60 text-sm mt-1">Check the <Link to="/admin/orders" className="text-accent hover:underline">orders page</Link> for upcoming.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayOrders.filter((o) => o.status !== 'cancelled').map((o) => (
            <Card key={o.id} className="!p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                <span className="text-xs text-white/30">#{o.id}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{o.productName}</h3>
              <p className="text-xs text-white/60 mb-2">{[o.size, o.flavor].filter(Boolean).join(' · ')}</p>
              <p className="text-sm text-white/80">{o.customerName}</p>
              {o.customerPhone && <p className="text-xs text-accent">{o.customerPhone}</p>}
              {o.deliveryTime && <p className="text-xs text-white/60 mt-1">⏰ {o.deliveryTime}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
