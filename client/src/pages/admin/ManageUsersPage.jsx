import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/formatDate.js';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api(`/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      setToast({ message: `Deleted ${deleteTarget.name}`, type: 'success' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setDeleteTarget(null);
    } finally { setIsDeleting(false); }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const waLink = (phone) => {
    const digits = String(phone || '').replace(/[^0-9]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  };

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-white/60">{users.length} registered</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone..."
          className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent w-full sm:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={search ? 'No matching customers' : 'No customers yet'}
          description={search ? 'Try a different search term.' : 'Customers will appear here once they register.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <Card key={u.id} className="!p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{u.name}</h3>
                  <p className="text-xs text-white/50 truncate">{u.email}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3 text-sm">
                {u.phone && (
                  <a
                    href={`tel:${u.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1.5 text-white/80 hover:text-accent transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {u.phone}
                  </a>
                )}
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Joined {formatDate(u.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-3 text-xs">
                  <div>
                    <div className="text-accent font-bold text-sm">{u.orderCount || 0}</div>
                    <div className="text-white/50">Orders</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold text-sm">{u.deliveredCount || 0}</div>
                    <div className="text-white/50">Completed</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {u.phone && waLink(u.phone) && (
                    <a
                      href={waLink(u.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      title="Open WhatsApp chat"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                    </a>
                  )}
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="w-9 h-9 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete user (removes all their orders)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Customer?"
        message={deleteTarget
          ? `Delete "${deleteTarget.name}" and all their ${deleteTarget.orderCount} order(s)? This cannot be undone.`
          : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Customer"
        variant="danger"
      />

      {toast && <Toast message={toast.message} type={toast.type || 'error'} onClose={() => setToast(null)} />}
    </div>
  );
}
