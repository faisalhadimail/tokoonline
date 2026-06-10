'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Home,
  Store,
  Zap,
  BookOpen,
  Shield,
  Heart,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useCartStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/helpers';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigationStore();
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const navLinks = [
    { label: 'Home', view: 'home' as const, icon: Home },
    { label: 'Shop', view: 'shop' as const, icon: Store },
    { label: 'Flash Sale', view: 'shop' as const, icon: Zap },
    { label: 'Blog', view: 'blog' as const, icon: BookOpen },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      useNavigationStore.getState().setFilters({ search: searchQuery.trim() });
      navigate.navigate('shop');
      setMobileOpen(false);
    }
  };

  const handleNavClick = (view: 'home' | 'shop' | 'blog') => {
    navigate.navigate(view);
    setMobileOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    navigate.navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top bar - dynamic promo banner (shown when active promos exist) */}

      {/* Main nav */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex-shrink-0 text-xl font-bold tracking-tight text-stone-900"
        >
          <span className="text-rose-600">LUXE</span> FASHION
        </button>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.view)}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-rose-600',
                navigate.currentView === link.view ? 'text-rose-600' : 'text-stone-600'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
          {isAuthenticated && user?.role === 'admin' && (
            <button
              onClick={() => { navigate.navigate('admin'); window.scrollTo(0, 0); }}
              className="flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-rose-600"
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          )}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-full border-stone-300 bg-stone-50 pl-9 text-sm"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => { navigate.navigate('cart'); window.scrollTo(0, 0); }}
            className="relative p-2 text-stone-600 transition-colors hover:text-rose-600"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 p-0 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
          </button>

          {/* User */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-full p-2 text-stone-600 transition-colors hover:text-rose-600">
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-stone-900">{user.name}</p>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { navigate.navigate('profile'); window.scrollTo(0, 0); }}>
                  <User className="mr-2 h-4 w-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate.navigate('profile-orders'); window.scrollTo(0, 0); }}>
                  <Package className="mr-2 h-4 w-4" /> Pesanan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate.navigate('profile-wishlist'); window.scrollTo(0, 0); }}>
                  <Heart className="mr-2 h-4 w-4" /> Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate.navigate('profile-addresses'); window.scrollTo(0, 0); }}>
                  <MapPin className="mr-2 h-4 w-4" /> Alamat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
              className="p-2 text-stone-600 transition-colors hover:text-rose-600"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-200 p-4">
                  <span className="text-lg font-bold tracking-tight text-stone-900">
                    <span className="text-rose-600">LUXE</span> FASHION
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Search */}
                <div className="p-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-full border-stone-300 bg-stone-50 pl-9"
                      />
                    </div>
                  </form>
                </div>

                <Separator />

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link.view)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          navigate.currentView === link.view
                            ? 'bg-rose-50 text-rose-600'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </button>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {isAuthenticated && user ? (
                    <div className="space-y-1">
                      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Akun Saya
                      </p>
                      <button
                        onClick={() => { navigate.navigate('profile'); setMobileOpen(false); window.scrollTo(0, 0); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                      >
                        <User className="h-5 w-5" /> Profil
                      </button>
                      <button
                        onClick={() => { navigate.navigate('profile-orders'); setMobileOpen(false); window.scrollTo(0, 0); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                      >
                        <Package className="h-5 w-5" /> Pesanan
                      </button>
                      <button
                        onClick={() => { navigate.navigate('profile-wishlist'); setMobileOpen(false); window.scrollTo(0, 0); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                      >
                        <Heart className="h-5 w-5" /> Wishlist
                      </button>
                      <button
                        onClick={() => { navigate.navigate('profile-addresses'); setMobileOpen(false); window.scrollTo(0, 0); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                      >
                        <MapPin className="h-5 w-5" /> Alamat
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { navigate.navigate('admin'); setMobileOpen(false); window.scrollTo(0, 0); }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                        >
                          <Shield className="h-5 w-5" /> Admin Panel
                        </button>
                      )}
                      <Separator className="my-4" />
                      <button
                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-5 w-5" /> Keluar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 px-3">
                      <Button
                        className="w-full bg-rose-600 text-white hover:bg-rose-700"
                        onClick={() => { navigate.navigate('login'); setMobileOpen(false); window.scrollTo(0, 0); }}
                      >
                        Masuk / Daftar
                      </Button>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Lainnya
                    </p>
                    <button
                      onClick={() => { navigate.navigate('about'); setMobileOpen(false); window.scrollTo(0, 0); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Tentang Kami
                    </button>
                    <button
                      onClick={() => { navigate.navigate('contact'); setMobileOpen(false); window.scrollTo(0, 0); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Hubungi Kami
                    </button>
                    <button
                      onClick={() => { navigate.navigate('faq'); setMobileOpen(false); window.scrollTo(0, 0); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      FAQ
                    </button>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
