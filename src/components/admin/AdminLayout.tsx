'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Gift,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useAdminStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, view: 'admin' as const },
  { id: 'products', label: 'Products', icon: Package, view: 'admin-products' as const },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, view: 'admin-orders' as const },
  { id: 'vouchers', label: 'Vouchers', icon: Ticket, view: 'admin-vouchers' as const },
  { id: 'promos', label: 'Promos', icon: Gift, view: 'admin-promos' as const },
  { id: 'blog', label: 'Blog', icon: FileText, view: 'admin-blog' as const },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, view: 'admin' as const },
  { id: 'settings', label: 'Settings', icon: Settings, view: 'admin' as const },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarOpen, toggleSidebar, activeTab, setActiveTab } = useAdminStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigationStore(s => s.navigate);
  const [notifications] = useState(3);

  const handleTabClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    navigate(item.view);
    if (sidebarOpen) toggleSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
          'w-64 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              LUXE
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={toggleSidebar}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-rose-500')} />
                  {item.label}
                  {item.id === 'orders' && (
                    <Badge className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0">
                      New
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Admin info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-rose-100 text-rose-600 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 leading-none mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
