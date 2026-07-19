import { lazy, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import { Routes, Route } from 'react-router-dom';
import { ProductGridSkeleton } from './components/ImageSkeleton';

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const Category = lazy(() => import('./pages/Category'));
const Account = lazy(() => import('./pages/Account'));
const Orders = lazy(() => import('./pages/Orders'));

// Admin Pages - Lazy loaded
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 h-7 bg-gray-200 rounded animate-pulse w-40" />
      <ProductGridSkeleton count={8} />
    </div>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <AuthModal />
      <CheckoutModal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
          
          {/* Category Routes (must be last - catches /:slug) */}
          <Route path="/:slug" element={<Category />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
