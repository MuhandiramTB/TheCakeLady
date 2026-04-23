import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function HomePage() {
  const [branding, setBranding] = useState({ salonName: 'TheCakeLady' });
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api('/config/branding').then((r) => setBranding(r.data)).catch(() => {});
    api('/products?featured=true').then((r) => setFeatured(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-hero py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-secondary rounded-full blur-[100px]" />
        </div>
        <div className="relative container mx-auto max-w-4xl text-center animate-fade-in">
          <p className="text-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4">Home-made with love</p>
          <h1 className="text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            Delicious cakes from <span className="text-gradient">{branding.salonName}</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Birthday, wedding, anniversary — every cake is baked fresh, made to order, and crafted just for you.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/products" className="inline-flex items-center gap-2 bg-gradient-rose text-primary font-bold px-7 py-3.5 rounded-xl hover:shadow-xl hover:shadow-accent/30 transition-all min-h-[52px]">
              Browse Cakes →
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all min-h-[52px]">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Fresh from the oven</p>
                <h2 className="text-2xl sm:text-3xl font-bold">Featured Cakes</h2>
              </div>
              <Link to="/products" className="text-accent text-sm font-semibold hover:underline">See all cakes →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all">
                  <div className="aspect-square bg-gradient-to-br from-accent/10 to-secondary/10 relative overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">🎂</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-accent font-medium mb-1">{p.categoryName}</p>
                    <h3 className="font-semibold text-white mb-2 truncate">{p.name}</h3>
                    <p className="text-lg font-bold text-accent">From Rs. {p.basePrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why order with us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🧁', title: 'Fresh & Home-made', desc: 'Baked fresh on the day of delivery — never frozen.' },
              { icon: '🎨', title: 'Fully customizable', desc: 'Size, flavor, message on cake — you choose.' },
              { icon: '💬', title: 'Personal touch', desc: 'WhatsApp us anytime. Real people, not bots.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
