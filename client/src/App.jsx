import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ServerWakingOverlay from './components/ServerWakingOverlay.jsx';
import RateLimitOverlay from './components/RateLimitOverlay.jsx';

// Public / customer pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage.jsx';
import ManageOrdersPage from './pages/admin/ManageOrdersPage.jsx';
import ManageProductsPage from './pages/admin/ManageProductsPage.jsx';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage.jsx';
import ManageUsersPage from './pages/admin/ManageUsersPage.jsx';
import StoreInfoPage from './pages/admin/StoreInfoPage.jsx';
import QuickOrderPage from './pages/admin/QuickOrderPage.jsx';

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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><ManageOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><ManageProductsPage /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ManageCategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsersPage /></ProtectedRoute>} />
          <Route path="/admin/quick-order" element={<ProtectedRoute adminOnly><QuickOrderPage /></ProtectedRoute>} />
          <Route path="/admin/store-info" element={<ProtectedRoute adminOnly><StoreInfoPage /></ProtectedRoute>} />

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
