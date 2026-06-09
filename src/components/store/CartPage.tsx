'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Gift,
  Truck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useCartStore } from '@/stores';
import { formatRupiah } from '@/lib/helpers';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigationStore();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const voucherDiscount = useCartStore((s) => s.voucherDiscount);
  const applyVoucher = useCartStore((s) => s.applyVoucher);
  const removeVoucher = useCartStore((s) => s.removeVoucher);

  const [voucherInput, setVoucherInput] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoShippingDiscount, setPromoShippingDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; name: string; type: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const voucherMutation = useMutation({
    mutationFn: (code: string) => fetch(`/api/vouchers/validate?code=${encodeURIComponent(code)}`).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.valid) {
        applyVoucher(data.code, data.discount);
        toast.success(`Voucher ${data.code} berhasil diterapkan!`);
        setVoucherInput('');
      } else {
        toast.error(data.message || 'Voucher tidak valid');
      }
    },
    onError: () => {
      toast.error('Gagal memvalidasi voucher');
    },
  });

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    voucherMutation.mutate(voucherInput.trim().toUpperCase());
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    const productIds = items.map((i) => i.productId).join(',');
    fetch(`/api/promos/validate?code=${encodeURIComponent(promoInput.trim())}&subtotal=${getSubtotal()}&shippingCost=15000&productIds=${productIds}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setPromoDiscount(data.discount || 0);
          setPromoShippingDiscount(data.shippingDiscount || 0);
          setAppliedPromo({ code: data.promo.code, name: data.promo.name, type: data.promo.type });
          toast.success(`Promo ${data.promo.code} berhasil diterapkan!`);
          setPromoInput('');
        } else {
          toast.error(data.message || 'Promo tidak valid');
        }
      })
      .catch(() => toast.error('Gagal memvalidasi promo'))
      .finally(() => setPromoLoading(false));
  };

  const removePromo = () => {
    setPromoDiscount(0);
    setPromoShippingDiscount(0);
    setAppliedPromo(null);
  };

  const handleCheckout = () => {
    navigate.navigate('checkout');
    window.scrollTo(0, 0);
  };

  const estShipping = 15000;
  const totalDiscount = voucherDiscount + promoDiscount;
  const shippingAfterDiscount = Math.max(0, estShipping - promoShippingDiscount);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100">
          <ShoppingBag className="h-12 w-12 text-stone-300" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-stone-900">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-stone-500">
          Belum ada produk di keranjang Anda. Yuk mulai belanja!
        </p>
        <Button
          className="mt-6 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Lanjut Belanja
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Keranjang</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900">
        Keranjang Belanja ({items.length} item)
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.color}-${item.size}`} className="border-stone-200">
                <CardContent className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-stone-900">{item.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.color && (
                        <Badge variant="secondary" className="text-xs">{item.color}</Badge>
                      )}
                      {item.size && (
                        <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-bold text-rose-600">
                      {formatRupiah(item.price)}
                    </p>
                    {item.comparePrice && item.comparePrice > item.price && (
                      <p className="text-xs text-stone-400 line-through">{formatRupiah(item.comparePrice)}</p>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      className="text-stone-400 transition-colors hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center rounded-lg border border-stone-300">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                        className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                        className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Promo & Voucher Section */}
          <div className="mt-6 space-y-4">
            {/* Promo Code */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Gift className="h-4 w-4 text-rose-600" /> Kode Promo
              </h3>
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-violet-700">
                      Promo: {appliedPromo.code} — {appliedPromo.name}
                    </p>
                    {promoDiscount > 0 && (
                      <p className="text-xs text-violet-600">Potongan Harga: -{formatRupiah(promoDiscount)}</p>
                    )}
                    {promoShippingDiscount > 0 && (
                      <p className="text-xs text-emerald-600">Potongan Ongkir: -{formatRupiah(promoShippingDiscount)}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-violet-600 hover:text-violet-700"
                    onClick={removePromo}
                  >
                    Hapus
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode promo"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="h-10 flex-1 border-stone-300 uppercase"
                  />
                  <Button
                    type="submit"
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    disabled={promoLoading}
                  >
                    {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pakai'}
                  </Button>
                </form>
              )}
            </div>

            {/* Voucher Code */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Tag className="h-4 w-4" /> Kode Voucher
              </h3>
              {voucherCode ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Voucher: {voucherCode}</p>
                    <p className="text-xs text-emerald-600">Potongan: -{formatRupiah(voucherDiscount)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700"
                    onClick={removeVoucher}
                  >
                    Hapus
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="h-10 flex-1 border-stone-300 uppercase"
                  />
                  <Button
                    type="submit"
                    className="bg-stone-900 text-white hover:bg-stone-800"
                    disabled={voucherMutation.isPending}
                  >
                    {voucherMutation.isPending ? 'Memverifikasi...' : 'Pakai'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24 border-stone-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-stone-900">Ringkasan Pesanan</h3>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium text-stone-900">{formatRupiah(getSubtotal())}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Diskon</span>
                    <span className="font-medium text-emerald-600">-{formatRupiah(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Ongkos Kirim</span>
                  <span className="font-medium text-stone-900">
                    {promoShippingDiscount >= estShipping ? (
                      <span className="text-emerald-600">Gratis</span>
                    ) : (
                      formatRupiah(shippingAfterDiscount)
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="text-lg font-bold text-rose-600">
                    {formatRupiah(Math.max(0, getSubtotal() - totalDiscount + shippingAfterDiscount))}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-6 w-full bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleCheckout}
              >
                Checkout
              </Button>

              <button
                onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
                className="mt-3 flex w-full items-center justify-center gap-2 text-sm text-stone-500 hover:text-rose-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Lanjut Belanja
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
