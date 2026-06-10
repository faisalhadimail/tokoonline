'use client';

import { useNavigationStore } from '@/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import HomePage from '@/components/store/HomePage';
import ShopPage from '@/components/store/ShopPage';
import ProductDetailPage from '@/components/store/ProductDetailPage';
import CartPage from '@/components/store/CartPage';
import CheckoutPage from '@/components/store/CheckoutPage';
import OrderSuccessPage from '@/components/store/OrderSuccessPage';
import { LoginPage, RegisterPage } from '@/components/store/AuthPages';
import { ProfilePage, OrdersPage, WishlistPage, AddressesPage } from '@/components/store/ProfilePages';
import { AboutPage, ContactPage, FAQPage, TermsPage, TrackingPage } from '@/components/store/StaticPages';
import BlogPage from '@/components/store/BlogPage';
import AdminPage from '@/components/admin/AdminPage';

function ViewRouter() {
  const currentView = useNavigationStore((s) => s.currentView);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  switch (currentView) {
    case 'home':
      return <HomePage />;
    case 'shop':
      return <ShopPage />;
    case 'product':
      return <ProductDetailPage />;
    case 'cart':
      return <CartPage />;
    case 'checkout':
      return <CheckoutPage />;
    case 'order-success':
      return <OrderSuccessPage />;
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'profile':
      return <ProfilePage />;
    case 'profile-orders':
      return <OrdersPage />;
    case 'profile-wishlist':
      return <WishlistPage />;
    case 'profile-addresses':
      return <AddressesPage />;
    case 'admin':
    case 'admin-products':
    case 'admin-orders':
    case 'admin-vouchers':
    case 'admin-promos':
    case 'admin-blog':
      return <AdminPage />;
    case 'blog':
    case 'blog-detail':
      return <BlogPage />;
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'faq':
      return <FAQPage />;
    case 'terms':
      return <TermsPage />;
    case 'tracking':
      return <TrackingPage />;
    default:
      return <HomePage />;
  }
}

export default function MainApp() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: 1,
      },
    },
  }));

  const currentView = useNavigationStore((s) => s.currentView);
  const isAdmin = currentView === 'admin' || currentView === 'admin-products' || currentView === 'admin-orders' || currentView === 'admin-vouchers' || currentView === 'admin-promos' || currentView === 'admin-blog';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          <ViewRouter />
        </main>
        {!isAdmin && <Footer />}
      </div>
    </QueryClientProvider>
  );
}
