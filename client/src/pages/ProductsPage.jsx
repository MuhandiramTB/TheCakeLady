import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { SkeletonPage } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/products'),
      api('/categories'),
    ])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (activeCategoryId && p.categoryId !== activeCategoryId) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }
    return true;
  });

  if (isLoading) return <SkeletonPage cards={6} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Our Cakes</h1>
        <p className="text-white/60 text-sm">Choose a cake, pick your size and flavor, and we'll bake it fresh.</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cakes by name..."
          className="w-full border border-white/10 bg-[#2a1b22] text-white rounded-lg px-4 py-3 min-h-[48px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            !activeCategoryId ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategoryId(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategoryId === c.id ? 'bg-gradient-rose text-primary' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🎂" title="No cakes match" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all">
              <div className="aspect-square bg-gradient-to-br from-accent/10 to-secondary/10 relative overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">🎂</div>
                )}
                {p.isFeatured ? (
                  <span className="absolute top-2 left-2 bg-accent text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Featured</span>
                ) : null}
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs text-accent font-medium mb-1 truncate">{p.categoryName}</p>
                <h3 className="font-semibold text-white mb-1 truncate text-sm sm:text-base">{p.name}</h3>
                <p className="text-base sm:text-lg font-bold text-accent">From Rs. {p.basePrice}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
