'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  CreditCard,
  Shield,
  Gift,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores';
import { toast } from 'sonner';

export default function Footer() {
  const navigate = useNavigationStore();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Terima kasih telah berlangganan newsletter kami!');
      setEmail('');
    }
  };

  const handleNav = (view: 'home' | 'shop' | 'blog' | 'about' | 'contact' | 'faq' | 'terms' | 'tracking') => {
    navigate.navigate(view);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      {/* Features strip */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
              <Gift className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">Promo Menarik</p>
              <p className="text-xs text-stone-500">Diskon & potongan ongkir</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
              <Shield className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">Pembayaran Aman</p>
              <p className="text-xs text-stone-500">100% transaksi aman</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
              <RotateCcw className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">Easy Return</p>
              <p className="text-xs text-stone-500">30 hari pengembalian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
              <Phone className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">CS 24/7</p>
              <p className="text-xs text-stone-500">WhatsApp & Live Chat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-stone-900">
              <span className="text-rose-600">LUXE</span> FASHION
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Toko fashion online terpercaya di Indonesia. Menyediakan koleksi fashion terkini
              dengan kualitas premium dan harga terjangkau.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-colors hover:bg-rose-600 hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-colors hover:bg-rose-600 hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-colors hover:bg-rose-600 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-colors hover:bg-emerald-500 hover:text-white">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Kategori</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                'Fashion Wanita', 'Fashion Pria', 'Fashion Anak',
                'Sepatu', 'Tas', 'Aksesoris', 'Hijab', 'Jam Tangan',
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => { handleNav('shop'); }}
                    className="text-sm text-stone-500 transition-colors hover:text-rose-600"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Layanan Pelanggan</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: 'Tentang Kami', view: 'about' as const },
                { label: 'Hubungi Kami', view: 'contact' as const },
                { label: 'FAQ', view: 'faq' as const },
                { label: 'Syarat & Ketentuan', view: 'terms' as const },
                { label: 'Lacak Pesanan', view: 'tracking' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNav(item.view)}
                    className="text-sm text-stone-500 transition-colors hover:text-rose-600"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Newsletter</h4>
            <p className="mt-4 text-sm text-stone-500">
              Berlangganan untuk mendapatkan promo dan update koleksi terbaru.
            </p>
            <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 flex-1 rounded-lg border-stone-300 bg-white text-sm"
              />
              <Button type="submit" size="sm" className="bg-rose-600 text-white hover:bg-rose-700">
                Kirim
              </Button>
            </form>

            <div className="mt-6">
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Metode Pembayaran</h5>
              <div className="flex flex-wrap gap-2">
                {['QRIS', 'BCA', 'Mandiri', 'GoPay', 'OVO', 'COD'].map((pm) => (
                  <span
                    key={pm}
                    className="flex h-7 items-center rounded border border-stone-200 bg-white px-2 text-[10px] font-medium text-stone-600"
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <Separator />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
        <p className="text-xs text-stone-400">
          &copy; {new Date().getFullYear()} LUXE FASHION. All rights reserved.
        </p>
        <p className="flex items-center gap-1 text-xs text-stone-400">
          <CreditCard className="h-3 w-3" />
          Secure payments powered by Midtrans
        </p>
      </div>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-emerald-600"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
}
