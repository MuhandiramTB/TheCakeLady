import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Modal from '../../ui/Modal.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', displayOrder: 0 });
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const loadCategories = async () => {
    try { const res = await api('/categories?all=true'); setCategories(res.data); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => { setEditingCategory(null); setForm({ name: '', displayOrder: categories.length }); setShowModal(true); };
  const openEdit = (cat) => { setEditingCategory(cat); setForm({ name: cat.name, displayOrder: cat.displayOrder }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) await api(`/categories/${editingCategory.id}`, { method: 'PUT', body: form });
      else await api('/categories', { method: 'POST', body: form });
      setShowModal(false);
      loadCategories();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api(`/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      setDeleteTarget(null);
      setToast(err.message);
    } finally { setIsDeleting(false); }
  };

  if (isLoading) return <SkeletonPage cards={3} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Categories</h1>
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon="📁" title="No categories yet" description="Create your first category to organize services." actionLabel="Create Category" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-lg">{cat.name}</h3>
                  <span className="text-white/60 text-sm">Order: {cat.displayOrder}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 min-h-[36px] transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(cat)} className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 min-h-[36px] transition-colors">
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Boys, Ladies, Spa" required />
          <Input label="Display Order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
          <Button type="submit" className="w-full">{editingCategory ? 'Update Category' : 'Create Category'}</Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
      />

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
