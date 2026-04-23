import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Modal from '../../ui/Modal.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

const INITIAL_FORM = {
  categoryId: '', name: '', description: '', imageUrl: '',
  basePrice: 0, sizeOptions: '', flavorOptions: '',
  isActive: true, isFeatured: false,
};

// Image picker → base64 data URL (200 KB cap)
function ImagePicker({ value, onChange }) {
  const [error, setError] = useState('');
  const MAX = 200 * 1024;
  const handle = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Pick an image file (PNG/JPG).'); return; }
    if (file.size > MAX) { setError(`Image too large (${Math.round(file.size / 1024)} KB). Max 200 KB.`); return; }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1.5">Cake photo</label>
      {value && (
        <div className="flex items-center gap-3 mb-2 p-3 bg-white/5 border border-white/10 rounded-lg">
          <img src={value} alt="preview" className="w-20 h-20 rounded-lg object-cover bg-white/10 flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="flex-1">
            <p className="text-xs text-white/80 font-medium">Current image</p>
            <p className="text-xs text-white/50">{value.startsWith('data:') ? 'Uploaded' : 'Remote URL'}</p>
          </div>
          <button type="button" onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10">Remove</button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 cursor-pointer min-h-[40px]">
        📷 {value ? 'Replace image' : 'Upload image'}
        <input type="file" accept="image/*" onChange={(e) => handle(e.target.files?.[0])} className="hidden" />
      </label>
      <p className="text-xs text-white/50 mt-1.5">Max 200 KB. Square 1:1 images look best.</p>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api('/products?all=true'), api('/categories?all=true')]);
      setProducts(p.data);
      setCategories(c.data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, categoryId: categories[0]?.id || '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      categoryId: p.categoryId, name: p.name, description: p.description || '',
      imageUrl: p.imageUrl || '', basePrice: p.basePrice,
      sizeOptions: p.sizeOptions || '', flavorOptions: p.flavorOptions || '',
      isActive: !!p.isActive, isFeatured: !!p.isFeatured,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, categoryId: Number(form.categoryId), basePrice: Number(form.basePrice) };
    try {
      if (editing) await api(`/products/${editing.id}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      setShowModal(false);
      load();
    } catch (err) { setError(err.message); }
  };

  const toggleActive = async (p) => {
    try { await api(`/products/${p.id}`, { method: 'PUT', body: { isActive: !p.isActive } }); load(); }
    catch (err) { setToast(err.message); }
  };

  const toggleFeatured = async (p) => {
    try { await api(`/products/${p.id}`, { method: 'PUT', body: { isFeatured: !p.isFeatured } }); load(); }
    catch (err) { setToast(err.message); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try { await api(`/products/${deleteTarget.id}`, { method: 'DELETE' }); setDeleteTarget(null); load(); }
    catch (err) { setDeleteTarget(null); setToast(err.message); }
    finally { setIsDeleting(false); }
  };

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Cakes</h1>
        <Button onClick={openCreate} disabled={categories.length === 0}>+ Add Cake</Button>
      </div>

      {categories.length === 0 && (
        <Card className="bg-amber-500/10 border border-amber-500/20 mb-4">
          <p className="text-amber-400 text-sm">Create categories first before adding cakes.</p>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState icon="🎂" title="No cakes yet" description="Add your first cake to the menu." actionLabel="Add Cake" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className={`!p-0 overflow-hidden transition-opacity ${!p.isActive ? 'opacity-50' : ''}`}>
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 to-secondary/10 relative overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">🎂</div>
                )}
                {p.isFeatured && (
                  <span className="absolute top-2 left-2 bg-accent text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">⭐ Featured</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-accent font-medium mb-1">{p.categoryName}</p>
                <h3 className="font-semibold text-white mb-1 truncate">{p.name}</h3>
                <p className="text-base font-bold text-accent mb-3">Rs. {p.basePrice}</p>

                <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-white/5">
                  <button onClick={() => toggleActive(p)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg min-h-[32px] transition-colors ${
                      p.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}>{p.isActive ? 'Active' : 'Inactive'}</button>
                  <button onClick={() => toggleFeatured(p)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg min-h-[32px] transition-colors ${
                      p.isFeatured ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}>{p.isFeatured ? '⭐ Featured' : 'Feature'}</button>
                  <button onClick={() => openEdit(p)}
                    className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-blue-500/30 min-h-[32px]">Edit</button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="text-xs font-medium bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/30 min-h-[32px] ml-auto">Delete</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Cake' : 'New Cake'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <ImagePicker value={form.imageUrl} onChange={(val) => setForm((f) => ({ ...f, imageUrl: val }))} />

          <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Cake Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic Chocolate" required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
          <Input label="Base Price (Rs.)" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
          <Input label="Size options (comma-separated)" value={form.sizeOptions} onChange={(e) => setForm({ ...form, sizeOptions: e.target.value })} placeholder="0.5kg,1kg,2kg" />
          <Input label="Flavor options (comma-separated)" value={form.flavorOptions} onChange={(e) => setForm({ ...form, flavorOptions: e.target.value })} placeholder="Vanilla,Chocolate,Strawberry" />

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent/50" />
              Active (visible to customers)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent/50" />
              ⭐ Show on home page
            </label>
          </div>

          <Button type="submit" className="w-full">{editing ? 'Update Cake' : 'Create Cake'}</Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Cake?"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
      />
      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
