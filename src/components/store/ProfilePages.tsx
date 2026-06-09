'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  User,
  Package,
  Heart,
  MapPin,
  Star,
  Award,
  ShoppingBag,
  Trash2,
  Plus,
  Edit2,
  X,
  Eye,
  ChevronDown,
  LogOut,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigationStore, useAuthStore, useCartStore, useWishlistStore } from '@/stores';
import { formatRupiah, formatDate, formatDateTime, getMemberBadge, getOrderStatusColor, getOrderStatusLabel } from '@/lib/helpers';
import type { Order, Product } from '@/lib/types';
import { toast } from 'sonner';

// ========== PROFILE PAGE ==========
export function ProfilePage() {
  const navigate = useNavigationStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <User className="h-16 w-16 text-stone-300" />
        <h2 className="mt-4 text-xl font-bold text-stone-900">Silakan Masuk</h2>
        <p className="mt-2 text-sm text-stone-500">Anda perlu login untuk melihat profil</p>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
        >
          Masuk
        </Button>
      </div>
    );
  }

  const badge = getMemberBadge(user.memberLevel);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Profil</span>
      </nav>

      {/* Profile Card */}
      <Card className="border-stone-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
              <p className="text-sm text-stone-500">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={badge.color}>{badge.label}</Badge>
                {user.phone && (
                  <span className="text-sm text-stone-500">{user.phone}</span>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Points */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <Gift className="mx-auto h-6 w-6 text-amber-500" />
              <p className="mt-2 text-2xl font-bold text-amber-600">{user.points.toLocaleString()}</p>
              <p className="text-xs text-stone-500">Poin</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 text-center">
              <Package className="mx-auto h-6 w-6 text-rose-600" />
              <p className="mt-2 text-2xl font-bold text-rose-600">0</p>
              <p className="text-xs text-stone-500">Pesanan</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <Heart className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="mt-2 text-2xl font-bold text-emerald-600">0</p>
              <p className="text-xs text-stone-500">Wishlist</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pesanan Saya', icon: Package, view: 'profile-orders' as const },
          { label: 'Wishlist', icon: Heart, view: 'profile-wishlist' as const },
          { label: 'Alamat', icon: MapPin, view: 'profile-addresses' as const },
          { label: 'Keluar', icon: LogOut, view: 'home' as const, isLogout: true },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.isLogout) {
                logout();
                toast.success('Berhasil keluar');
              }
              navigate.navigate(item.view);
              window.scrollTo(0, 0);
            }}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
              item.isLogout
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-stone-200 text-stone-700 hover:border-rose-200 hover:bg-rose-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== ORDERS PAGE ==========
export function OrdersPage() {
  const navigate = useNavigationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['user-orders'],
    queryFn: () => fetch('/api/orders').then((r) => r.json()),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <User className="h-16 w-16 text-stone-300" />
        <h2 className="mt-4 text-xl font-bold text-stone-900">Silakan Masuk</h2>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
        >
          Masuk
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => { navigate.navigate('profile'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Profil</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Pesanan</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-stone-900">Pesanan Saya</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-stone-300" />
          <h3 className="mt-4 text-lg font-semibold text-stone-900">Belum ada pesanan</h3>
          <p className="mt-2 text-sm text-stone-500">Mulai belanja untuk membuat pesanan pertama Anda!</p>
          <Button
            className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
          >
            Belanja Sekarang
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-stone-200">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-stone-900">{order.orderNumber}</p>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">{formatDateTime(order.createdAt)}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {order.items?.length || 0} item • Total:{' '}
                      <span className="font-bold text-rose-600">{formatRupiah(order.total)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-stone-300"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Nomor Pesanan</p>
                <p className="text-sm font-bold text-stone-900">{selectedOrder.orderNumber}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Status</p>
                <Badge className={getOrderStatusColor(selectedOrder.status)}>
                  {getOrderStatusLabel(selectedOrder.status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Tanggal</p>
                <p className="text-sm text-stone-900">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Kurir</p>
                <p className="text-sm text-stone-900">{selectedOrder.courier} - {selectedOrder.courierService}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Pembayaran</p>
                <p className="text-sm text-stone-900">{selectedOrder.paymentMethod?.toUpperCase()}</p>
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-semibold text-stone-900">Item Pesanan</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm">
                    <div>
                      <p className="text-stone-900">{item.productName}</p>
                      <p className="text-xs text-stone-500">
                        {item.variation} • {item.quantity}x
                      </p>
                    </div>
                    <p className="font-medium text-stone-900">{formatRupiah(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span>{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkir</span>
                  <span>{formatRupiah(selectedOrder.shippingCost)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(selectedOrder.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-rose-600">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== WISHLIST PAGE ==========
export function WishlistPage() {
  const navigate = useNavigationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const addItem = useCartStore((s) => s.addItem);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['wishlist-products', wishlistItems],
    queryFn: () => fetch(`/api/products?ids=${wishlistItems.join(',')}`).then((r) => r.json()),
    enabled: wishlistItems.length > 0,
  });
  const products = Array.isArray(productsData) ? productsData : productsData?.products || [];

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Heart className="h-16 w-16 text-stone-300" />
        <h2 className="mt-4 text-xl font-bold text-stone-900">Silakan Masuk</h2>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
        >
          Masuk
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => { navigate.navigate('profile'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Profil</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Wishlist</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-stone-900">
        Wishlist ({wishlistItems.length})
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="h-16 w-16 text-stone-300" />
          <h3 className="mt-4 text-lg font-semibold text-stone-900">Wishlist Kosong</h3>
          <p className="mt-2 text-sm text-stone-500">Tambahkan produk favorit Anda ke wishlist</p>
          <Button
            className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
          >
            Belanja Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="group cursor-pointer overflow-hidden border-stone-200 transition-all hover:shadow-lg">
              <CardContent className="p-0" onClick={() => { navigate.navigate('product', product.id); window.scrollTo(0, 0); }}>
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <Image
                    src={product.images?.[0] || '/images/products/dress-1.png'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(product.id);
                      toast.success('Dihapus dari wishlist');
                    }}
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 p-0 backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-stone-800">{product.name}</h3>
                  <p className="mt-1 text-sm font-bold text-rose-600">{formatRupiah(product.price)}</p>
                  <Button
                    size="sm"
                    className="mt-2 w-full gap-1 bg-stone-900 text-white hover:bg-stone-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        productId: product.id,
                        name: product.name,
                        image: product.images?.[0] || '',
                        price: product.price,
                        comparePrice: product.comparePrice,
                        quantity: 1,
                      });
                      toast.success('Ditambahkan ke keranjang');
                    }}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Keranjang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== ADDRESSES PAGE ==========
export function AddressesPage() {
  const navigate = useNavigationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [addresses, setAddresses] = useState([
    {
      id: '1',
      recipient: 'Customer LUXE',
      phone: '081234567890',
      address: 'Jl. Sudirman No. 123, RT 01/RW 02',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      isDefault: true,
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [form, setForm] = useState({
    recipient: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
  });

  const openAddDialog = () => {
    setEditingAddress(null);
    setForm({ recipient: '', phone: '', address: '', city: '', province: '', postalCode: '', isDefault: false });
    setDialogOpen(true);
  };

  const openEditDialog = (addr: typeof addresses[0]) => {
    setEditingAddress(addr.id);
    setForm({
      recipient: addr.recipient,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress ? { ...a, ...form } : a))
      );
      toast.success('Alamat berhasil diperbarui');
    } else {
      setAddresses((prev) => [...prev, { ...form, id: Date.now().toString() }]);
      toast.success('Alamat baru berhasil ditambahkan');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alamat berhasil dihapus');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <MapPin className="h-16 w-16 text-stone-300" />
        <h2 className="mt-4 text-xl font-bold text-stone-900">Silakan Masuk</h2>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
        >
          Masuk
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => { navigate.navigate('profile'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Profil</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Alamat</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Alamat Saya</h1>
        <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={openAddDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Tambah Alamat
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr) => (
          <Card key={addr.id} className="border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900">{addr.recipient}</p>
                    {addr.isDefault && (
                      <Badge className="bg-rose-100 text-rose-600 text-[10px]">Utama</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{addr.phone}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDialog(addr)}
                    className="p-2 text-stone-400 hover:text-rose-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-stone-700">Nama Penerima</label>
              <Input
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                className="h-10 border-stone-300"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-700">No. Telepon</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-10 border-stone-300"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-700">Alamat Lengkap</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="min-h-[80px] w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-stone-700">Kota</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="h-10 border-stone-300"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-700">Provinsi</label>
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="h-10 border-stone-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-700">Kode Pos</label>
              <Input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="h-10 border-stone-300"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="h-4 w-4 accent-rose-600"
              />
              <label htmlFor="isDefault" className="text-sm text-stone-600">Jadikan alamat utama</label>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 border-stone-300" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-rose-600 text-white hover:bg-rose-700">
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
