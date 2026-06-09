'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah, formatNumber, formatDateTime, getOrderStatusColor, getOrderStatusLabel, truncate } from '@/lib/helpers';
import type { DashboardStats, Order, Product } from '@/lib/types';

interface DashboardOverviewProps {
  onNavigateOrders?: () => void;
  onNavigateProducts?: () => void;
}

export default function DashboardOverview({ onNavigateOrders, onNavigateProducts }: DashboardOverviewProps) {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['dashboard-recent-orders'],
    queryFn: () => fetch('/api/orders?limit=5&sort=latest').then((r) => r.json()),
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['dashboard-top-products'],
    queryFn: () => fetch('/api/products?limit=5&sort=best-selling').then((r) => r.json()),
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<Product[]>({
    queryKey: ['dashboard-low-stock'],
    queryFn: () => fetch('/api/products?lowStock=true&limit=5').then((r) => r.json()),
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatRupiah(stats.totalRevenue) : '-',
      trend: '+12.5%',
      trendUp: true,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats ? formatNumber(stats.totalOrders) : '-',
      trend: '+8.2%',
      trendUp: true,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Products',
      value: stats ? formatNumber(stats.totalProducts) : '-',
      trend: '+3.1%',
      trendUp: true,
      icon: Package,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Total Customers',
      value: stats ? formatNumber(stats.totalCustomers) : '-',
      trend: '-0.4%',
      trendUp: false,
      icon: Users,
      color: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="py-4">
                <CardContent className="px-4 pt-0">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="py-4">
                  <CardContent className="px-4 pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {card.trendUp ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                        {card.trend} vs last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Revenue Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Overview (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : stats?.analytics && stats.analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(val: number) => formatRupiah(val)}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatRupiah(value), 'Revenue']}
                    labelFormatter={(label: string) => {
                      const d = new Date(label);
                      return d.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={
                            typeof product.images === 'string'
                              ? JSON.parse(product.images)[0]
                              : product.images[0]
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-300 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(product._count?.orderItems || 0)} sold
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-rose-600">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No products yet</p>
            )}
            {onNavigateProducts && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-rose-500 hover:text-rose-600 text-xs"
                onClick={onNavigateProducts}
              >
                View all products <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              {onNavigateOrders && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 text-xs h-7"
                  onClick={onNavigateOrders}
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-4 w-4 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatRupiah(order.total)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 mt-0.5 ${getOrderStatusColor(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 border border-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {truncate(product.name, 24)}
                      </p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 py-0 shrink-0 ml-2"
                    >
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All products well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
