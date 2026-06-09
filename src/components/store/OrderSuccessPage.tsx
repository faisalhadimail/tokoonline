'use client';

import { CheckCircle, ArrowRight, Package, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores';
import { formatRupiah } from '@/lib/helpers';

export default function OrderSuccessPage() {
  const navigate = useNavigationStore();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-14 w-14 text-emerald-500" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">
          Pesanan Berhasil Dibuat! 🎉
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Terima kasih telah berbelanja di LUXE FASHION
        </p>

        <Card className="mt-8 border-stone-200">
          <CardContent className="p-6">
            {/* Order Number */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Nomor Pesanan</p>
                <p className="text-lg font-bold text-stone-900">ORD-{Date.now().toString(36).toUpperCase()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Package className="h-6 w-6 text-rose-600" />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Payment Instructions */}
            <div className="rounded-lg bg-stone-50 p-4 text-left">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                <CreditCard className="h-4 w-4 text-rose-600" />
                Instruksi Pembayaran
              </h3>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                <p>1. Silakan transfer ke rekening berikut:</p>
                <div className="rounded bg-white p-2 font-mono text-xs">
                  <p>BCA: 123-456-7890</p>
                  <p>an: PT LUXE FASHION INDONESIA</p>
                </div>
                <p>2. Transfer sesuai total pesanan dalam waktu 24 jam.</p>
                <p>3. Pesanan akan diproses setelah pembayaran dikonfirmasi.</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 text-left">
              <Clock className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-stone-900">Estimasi Pengiriman</p>
                <p className="text-xs text-stone-500">3-5 hari kerja setelah pembayaran dikonfirmasi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            className="flex-1 bg-rose-600 text-white hover:bg-rose-700 sm:flex-none"
            onClick={() => { navigate.navigate('tracking'); window.scrollTo(0, 0); }}
          >
            Lacak Pesanan
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-stone-300 sm:flex-none"
            onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
          >
            Lanjut Belanja
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
