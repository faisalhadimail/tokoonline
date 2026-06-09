'use client';

import { useAdminStore, useNavigationStore } from '@/stores';
import AdminLayout from './AdminLayout';
import DashboardOverview from './DashboardOverview';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import VoucherManager from './VoucherManager';
import PromoManager from './PromoManager';
import BlogManager from './BlogManager';
import SettingsManager from './SettingsManager';
import HomepageSettings from './HomepageSettings';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { activeTab, setActiveTab } = useAdminStore();
  const navigate = useNavigationStore((s) => s.navigate);

  const handleNavigateProducts = () => {
    setActiveTab('products');
    navigate('admin-products');
  };

  const handleNavigateOrders = () => {
    setActiveTab('orders');
    navigate('admin-orders');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            onNavigateProducts={handleNavigateProducts}
            onNavigateOrders={handleNavigateOrders}
          />
        );
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'vouchers':
        return <VoucherManager />;
      case 'promos':
        return <PromoManager />;
      case 'blog':
        return <BlogManager />;
      case 'homepage':
        return <HomepageSettings />;
      case 'analytics':
        return <AnalyticsPlaceholder />;
      case 'settings':
        return <SettingsManager />;
      default:
        return (
          <DashboardOverview
            onNavigateProducts={handleNavigateProducts}
            onNavigateOrders={handleNavigateOrders}
          />
        );
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
}

function AnalyticsPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <p className="text-sm text-gray-500">View store performance and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            Advanced Analytics
          </h4>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Detailed analytics dashboard with sales trends, customer behavior,
            product performance, and more is coming soon.
          </p>
          <Badge variant="secondary" className="mt-4 bg-amber-100 text-amber-700 border-0">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
