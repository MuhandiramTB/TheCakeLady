import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ServerWakingOverlay from './components/ServerWakingOverlay.jsx';
import RateLimitOverlay from './components/RateLimitOverlay.jsx';

import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import DashboardPage from './pages/admin/DashboardPage.jsx';

// Placeholder admin pages — full implementations come in next iteration.
function ComingSoon({ title }) {
  return (
    <div className="py-12 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-white/60 mb-6">Coming in the next build.</p>
      <Link to="/admin" className="text-accent hover:underline">← Back to dashboard</Link>
    </div>
  );
}

const FULL_BLEED = ['/', '/login', '/register', '/forgot-password'];

function Layout() {
  const location = useLocation();
  const isFullBleed = FULL_BLEED.includes(location.pathname);

  return (
    <div className="min-h-screen bg-bg-dark">
      <OfflineBanner />
      <Navbar />
      <div className={isFullBleed ? '' : 'container mx-auto p-4 pb-8'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/contact" element={<ComingSoon title="Contact Page" />} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><ComingSoon title="Manage Orders" /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><ComingSoon title="Manage Products" /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ComingSoon title="Manage Categories" /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ComingSoon title="Customers" /></ProtectedRoute>} />
          <Route path="/admin/quick-order" element={<ProtectedRoute adminOnly><ComingSoon title="Quick Order" /></ProtectedRoute>} />
          <Route path="/admin/store-info" element={<ProtectedRoute adminOnly><ComingSoon title="Store Info" /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ServerWakingOverlay />
      <RateLimitOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
