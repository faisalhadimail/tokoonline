'use client';

import { useState } from 'react';
import { ChevronRight, MapPin, Phone, Mail, Clock, MessageCircle, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigationStore } from '@/stores';

// ========== ABOUT PAGE ==========
export function AboutPage() {
  const navigate = useNavigationStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Tentang Kami</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Tentang <span className="text-rose-600">LUXE FASHION</span>
        </h1>
        <p className="mt-4 text-center text-stone-500">
          Toko fashion online terpercaya di Indonesia sejak 2020
        </p>

        <div className="mt-12 space-y-8 text-stone-600">
          <section>
            <h2 className="text-xl font-bold text-stone-900">Visi Kami</h2>
            <p className="mt-3 leading-relaxed">
              Menjadi destinasi belanja fashion online terdepan di Indonesia yang menyediakan
              produk berkualitas premium dengan harga terjangkau bagi seluruh kalangan masyarakat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Misi Kami</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Menyediakan koleksi fashion terkini dengan kualitas terbaik</li>
              <li>Memberikan pengalaman belanja online yang nyaman dan aman</li>
              <li>Memberikan pelayanan pelanggan yang responsif dan profesional</li>
              <li>Mendukung industri fashion lokal Indonesia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Kenapa LUXE FASHION?</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Kualitas Premium', desc: 'Semua produk melewati quality control ketat' },
                { title: 'Harga Terjangkau', desc: 'Fashion berkualitas tanpa menguras kantong' },
                { title: 'Pengiriman Cepat', desc: 'Kerjasama dengan kurir terpercaya' },
                { title: 'Layanan 24/7', desc: 'Customer service selalu siap membantu' },
              ].map((item) => (
                <Card key={item.title} className="border-stone-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Tim Kami</h2>
            <p className="mt-3 leading-relaxed">
              LUXE FASHION didirikan oleh tim yang passionate tentang fashion dan e-commerce.
              Dengan pengalaman lebih dari 10 tahun di industri fashion, kami memahami kebutuhan
              pelanggan Indonesia akan fashion berkualitas dengan harga yang reasonable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ========== CONTACT PAGE ==========
export function ContactPage() {
  const navigate = useNavigationStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Hubungi Kami</span>
      </nav>

      <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
        Hubungi <span className="text-rose-600">Kami</span>
      </h1>
      <p className="mt-2 text-center text-sm text-stone-500">
        Ada pertanyaan? Tim kami siap membantu Anda
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900">Informasi Kontak</h2>

          {[
            { icon: MapPin, title: 'Alamat', desc: 'Jl. Fashion Boulevard No. 123, Jakarta Selatan 12345' },
            { icon: Phone, title: 'Telepon', desc: '+62 812-3456-7890' },
            { icon: Mail, title: 'Email', desc: 'hello@luxefashion.com' },
            { icon: Clock, title: 'Jam Operasional', desc: 'Senin - Sabtu: 09:00 - 21:00 WIB' },
            { icon: MessageCircle, title: 'WhatsApp', desc: '+62 812-3456-7890 (Quick Response)' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <item.icon className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="border-stone-200">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold text-stone-900">Kirim Pesan</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Pesan berhasil dikirim! (demo)');
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-stone-700">Nama</label>
                <Input placeholder="Nama Anda" className="h-10 border-stone-300" required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-700">Email</label>
                <Input type="email" placeholder="email@contoh.com" className="h-10 border-stone-300" required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-700">Subjek</label>
                <Input placeholder="Subjek pesan" className="h-10 border-stone-300" required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-700">Pesan</label>
                <textarea
                  placeholder="Tulis pesan Anda..."
                  className="min-h-[120px] w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-rose-600 text-white hover:bg-rose-700">
                Kirim Pesan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== FAQ PAGE ==========
export function FAQPage() {
  const navigate = useNavigationStore();

  const faqs = [
    {
      q: 'Bagaimana cara membuat akun?',
      a: 'Klik tombol "Masuk/Daftar" di halaman utama, lalu pilih "Daftar". Isi form pendaftaran dengan data yang benar dan akun Anda akan langsung aktif.',
    },
    {
      q: 'Apa metode pembayaran yang tersedia?',
      a: 'Kami menerima pembayaran melalui QRIS, Transfer Bank (BCA, Mandiri), E-Wallet (GoPay, OVO), dan COD (Bayar di Tempat).',
    },
    {
      q: 'Berapa lama pengiriman?',
      a: 'Untuk area Jawa, estimasi pengiriman 2-5 hari kerja. Untuk luar Jawa, estimasi 5-10 hari kerja tergantung lokasi.',
    },
    {
      q: 'Bagaimana kebijakan pengembalian?',
      a: 'Kami memberikan 30 hari pengembalian untuk produk yang cacat atau tidak sesuai. Produk harus dalam kondisi belum dicuci dan tag masih menempel.',
    },
    {
      q: 'Bagaimana cara melacak pesanan?',
      a: 'Anda dapat melacak pesanan melalui halaman "Lacak Pesanan" di menu layanan pelanggan, atau hubungi customer service kami via WhatsApp.',
    },
    {
      q: 'Apakah ada program membership?',
      a: 'Ya! Kami memiliki program membership dengan level Silver, Gold, Platinum, dan VIP. Setiap pembelian akan menghasilkan poin yang bisa ditukar dengan diskon.',
    },
    {
      q: 'Bagaimana cara menggunakan voucher?',
      a: 'Masukkan kode voucher di halaman keranjang belanja. Pastikan kode voucher masih berlaku dan memenuhi syarat minimum pembelian jika ada.',
    },
    {
      q: 'Apakah bisa request ukuran custom?',
      a: 'Maaf, saat ini kami belum menyediakan layanan custom size. Namun kami menyediakan berbagai ukuran dari S hingga XXL untuk sebagian besar produk.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">FAQ</span>
      </nav>

      <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
        Pertanyaan <span className="text-rose-600">Umum</span>
      </h1>
      <p className="mt-2 text-center text-sm text-stone-500">
        Temukan jawaban untuk pertanyaan yang sering diajukan
      </p>

      <div className="mt-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-stone-200">
              <AccordionTrigger className="text-left text-sm font-medium text-stone-900 hover:text-rose-600">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-stone-600">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 rounded-xl bg-stone-50 p-6 text-center">
        <h3 className="text-lg font-bold text-stone-900">Masih punya pertanyaan?</h3>
        <p className="mt-2 text-sm text-stone-500">Hubungi kami melalui WhatsApp untuk respon cepat</p>
        <Button
          className="mt-4 bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat WhatsApp
        </Button>
      </div>
    </div>
  );
}

// ========== TERMS PAGE ==========
export function TermsPage() {
  const navigate = useNavigationStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Syarat & Ketentuan</span>
      </nav>

      <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
        Syarat & <span className="text-rose-600">Ketentuan</span>
      </h1>
      <p className="mt-2 text-center text-sm text-stone-500">
        Terakhir diperbarui: Januari 2024
      </p>

      <div className="mt-12 space-y-8 text-sm text-stone-600 leading-relaxed">
        {[
          {
            title: '1. Ketentuan Umum',
            content: 'Dengan mengakses dan menggunakan website LUXE FASHION, Anda menyetujui untuk terikat dengan syarat dan ketentuan berikut. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.',
          },
          {
            title: '2. Akun Pengguna',
            content: 'Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda. Segala aktivitas yang dilakukan menggunakan akun Anda menjadi tanggung jawab penuh Anda.',
          },
          {
            title: '3. Produk dan Harga',
            content: 'Kami berusaha menampilkan informasi produk seakurat mungkin. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Kami berhak membatalkan pesanan jika ditemukan kesalahan harga.',
          },
          {
            title: '4. Pemesanan dan Pembayaran',
            content: 'Pemesanan dianggap sah setelah pembayaran berhasil dikonfirmasi. Batas waktu pembayaran adalah 24 jam setelah order dibuat. Pembayaran yang melebihi batas waktu akan otomatis dibatalkan.',
          },
          {
            title: '5. Pengiriman',
            content: 'Estimasi waktu pengiriman yang kami berikan adalah perkiraan dan dapat berbeda tergantung kondisi. Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak kurir.',
          },
          {
            title: '6. Pengembalian',
            content: 'Pengembalian dapat dilakukan dalam 30 hari setelah barang diterima dengan kondisi barang belum dicuci dan tag masih menempel. Ongkos kirim pengembalian ditanggung pembeli.',
          },
          {
            title: '7. Privasi',
            content: 'Data pribadi Anda akan dijaga sesuai dengan kebijakan privasi kami. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda.',
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-stone-900">{section.title}</h2>
            <p className="mt-2">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

// ========== TRACKING PAGE ==========
export function TrackingPage() {
  const navigate = useNavigationStore();
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setTrackingResult(trackingInput.trim());
    }
  };

  const trackingSteps = [
    { status: 'Pesanan Dibuat', date: '15 Jan 2024, 10:30', done: true },
    { status: 'Pembayaran Dikonfirmasi', date: '15 Jan 2024, 11:00', done: true },
    { status: 'Pesanan Diproses', date: '15 Jan 2024, 14:00', done: true },
    { status: 'Paket Dikirim', date: '16 Jan 2024, 09:00', done: true },
    { status: 'Dalam Pengiriman', date: '16 Jan 2024, 12:00', done: false },
    { status: 'Tiba di Tujuan', date: '-', done: false },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">Home</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Lacak Pesanan</span>
      </nav>

      <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
        Lacak <span className="text-rose-600">Pesanan</span>
      </h1>
      <p className="mt-2 text-center text-sm text-stone-500">
        Masukkan nomor pesanan untuk melacak status pengiriman
      </p>

      <form onSubmit={handleTrack} className="mx-auto mt-8 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Nomor Pesanan (contoh: ORD-...)"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="h-11 border-stone-300 pl-9"
          />
        </div>
        <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
          Lacak
        </Button>
      </form>

      {trackingResult && (
        <div className="mt-12">
          <Card className="border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Nomor Pesanan</p>
                  <p className="text-lg font-bold text-stone-900">{trackingResult}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500">Status</p>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    Dalam Pengiriman
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-0">
                {trackingSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        step.done ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'
                      }`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      {i < trackingSteps.length - 1 && (
                        <div className={`h-full w-0.5 ${
                          step.done ? 'bg-emerald-500' : 'bg-stone-200'
                        }`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-medium ${step.done ? 'text-stone-900' : 'text-stone-400'}`}>
                        {step.status}
                      </p>
                      <p className="text-xs text-stone-400">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!trackingResult && (
        <div className="mt-12 rounded-xl bg-stone-50 p-8 text-center">
          <Package className="mx-auto h-16 w-16 text-stone-300" />
          <h3 className="mt-4 text-lg font-semibold text-stone-900">Masukkan Nomor Pesanan</h3>
          <p className="mt-2 text-sm text-stone-500">
            Masukkan nomor pesanan yang tertera pada email konfirmasi pesanan Anda.
          </p>
        </div>
      )}
    </div>
  );
}

