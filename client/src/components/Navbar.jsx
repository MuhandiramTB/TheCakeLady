import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [branding, setBranding] = useState({ salonName: 'TheCakeLady', logoUrl: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { api('/config/branding').then((r) => setBranding(r.data)).catch(() => {}); }, []);
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => (path === '/admin' ? location.pathname === '/admin' : location.pathname === path || location.pathname.startsWith(path + '/'));

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/quick-order', label: 'Quick Order' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/users', label: 'Customers' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/store-info', label: 'Store Info' },
  ];
  const customerLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/my-orders', label: 'My Orders' },
    { to: '/contact', label: 'Contact' },
  ];
  const links = user?.role === 'admin' ? adminLinks : customerLinks;

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`text-sm font-medium min-h-[44px] flex items-center px-3 py-2 rounded-lg transition-all ${
        isActive(to) ? 'bg-accent/20 text-accent' : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link to={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity flex-shrink-0">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-accent/40 bg-white/10 shadow-md shadow-accent/20" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-rose flex items-center justify-center text-primary font-bold text-base shadow-md shadow-accent/20">
                {branding.salonName?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
            <span className="text-lg sm:text-xl font-bold tracking-tight">{branding.salonName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => navLink(l.to, l.label))}
            {user ? (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                <Link to="/profile" className={`flex items-center gap-1.5 text-sm font-medium min-h-[44px] px-3 py-2 rounded-lg transition-all ${isActive('/profile') ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                  <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white hover:bg-white/10 min-h-[44px] flex items-center px-3 py-2 rounded-lg transition-all" title="Logout">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="ml-2 text-sm font-semibold bg-gradient-rose text-primary px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all min-h-[44px] flex items-center">Sign In</Link>
            )}
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10" aria-label="Menu">
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-30 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-primary shadow-xl animate-slide-up">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-[48px] ${isActive(l.to) ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>{l.label}</Link>
              ))}
              <div className="border-t border-white/20 mt-2 pt-2">
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 min-h-[48px]">My Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 min-h-[48px]">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center justify-center gap-2 mx-4 mt-2 py-3 rounded-xl text-sm font-bold bg-gradient-rose text-primary min-h-[48px]">Sign In</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
