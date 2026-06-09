'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Star, ArrowRight, Quote, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProductCard from '@/components/store/ProductCard';
import FlashSaleTimer from '@/components/store/FlashSaleTimer';
import { useNavigationStore, useCartStore } from '@/stores';
import { formatRupiah } from '@/lib/helpers';
import type { Product, Category, FlashSaleItem } from '@/lib/types';

// ==================== TYPES ====================
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  buttonText: string;
  image: string;
  enabled: boolean;
}

interface HomepageSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

interface TestimonialItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
}

interface BrandPartner {
  id: string;
  name: string;
  enabled: boolean;
}

interface StoreSettings {
  heroSlides: HeroSlide[];
  homepageSections: HomepageSection[];
  testimonialsData: TestimonialItem[];
  brandPartners: BrandPartner[];
}

// ==================== DEFAULTS ====================
const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'Sari Dewi',
    avatar: 'SD',
    rating: 5,
    text: 'Kualitas bahan sangat bagus dan pengiriman cepat! Sudah langganan sejak tahun lalu. Recommended banget!',
    location: 'Jakarta',
  },
  {
    id: 't2',
    name: 'Budi Santoso',
    avatar: 'BS',
    rating: 5,
    text: 'Harga terjangkau dengan kualitas premium. Customer service juga sangat responsif. Top!',
    location: 'Bandung',
  },
  {
    id: 't3',
    name: 'Anisa Rahma',
    avatar: 'AR',
    rating: 4,
    text: 'Koleksi hijabnya lengkap dan modern. Packing rapi dan aman. Pasti beli lagi disini!',
    location: 'Surabaya',
  },
];

const DEFAULT_BRANDS: BrandPartner[] = [
  { id: 'b1', name: 'ZARA', enabled: true },
  { id: 'b2', name: 'H&M', enabled: true },
  { id: 'b3', name: 'UNIQLO', enabled: true },
  { id: 'b4', name: 'COTTON:ON', enabled: true },
  { id: 'b5', name: 'SHEIN', enabled: true },
  { id: 'b6', name: 'GUCCI', enabled: true },
  { id: 'b7', name: 'PRADA', enabled: true },
  { id: 'b8', name: 'BALENCIAGA', enabled: true },
];

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'h1',
    title: 'Koleksi Terbaru\n2024',
    subtitle: 'Temukan gaya terkini dengan koleksi eksklusif dari LUXE FASHION. Kualitas premium, harga terjangkau.',
    badge: 'Koleksi Terbaru',
    badgeColor: 'bg-rose-600 hover:bg-rose-700',
    buttonText: 'Belanja Sekarang',
    image: '/images/banners/hero1.png',
    enabled: true,
  },
  {
    id: 'h2',
    title: 'Diskon Hingga\n70%',
    subtitle: 'Jangan lewatkan flash sale minggu ini! Stok terbatas, buruan belanja sekarang.',
    badge: 'Flash Sale',
    badgeColor: 'bg-amber-500 hover:bg-amber-600',
    buttonText: 'Lihat Flash Sale',
    image: '/images/banners/hero2.png',
    enabled: true,
  },
];

// ==================== MAIN COMPONENT ====================
export default function HomePage() {
  const navigate = useNavigationStore();
  const addItem = useCartStore((s) => s.addItem);

  // Fetch homepage settings
  const { data: settingsData } = useQuery<StoreSettings>({
    queryKey: ['settings', 'homepage'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  // Derive settings with defaults
  const heroSlides = Array.isArray(settingsData?.heroSlides) && settingsData.heroSlides.length > 0
    ? settingsData.heroSlides
    : DEFAULT_HERO_SLIDES;

  const homepageSections = Array.isArray(settingsData?.homepageSections) && settingsData.homepageSections.length > 0
    ? settingsData.homepageSections
    : [];

  const testimonials = Array.isArray(settingsData?.testimonialsData) && settingsData.testimonialsData.length > 0
    ? settingsData.testimonialsData
    : DEFAULT_TESTIMONIALS;

  const brands = Array.isArray(settingsData?.brandPartners) && settingsData.brandPartners.length > 0
    ? settingsData.brandPartners.filter((b) => b.enabled)
    : DEFAULT_BRANDS.filter((b) => b.enabled);

  // Helper: check if a section is enabled
  const isSectionEnabled = (sectionId: string) => {
    if (homepageSections.length === 0) return true; // all enabled by default when no config
    const section = homepageSections.find((s) => s.id === sectionId);
    return section ? section.enabled : true;
  };

  // Helper: get enabled sections in order
  const enabledSections = homepageSections.length > 0
    ? homepageSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order).map((s) => s.id)
    : ['hero', 'categories', 'flash-sale', 'featured', 'promo-banners', 'new-arrivals', 'testimonials', 'brands', 'newsletter'];

  // Fetch data
  const { data: featuredData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetch('/api/products?featured=true&limit=8').then((r) => r.json()),
  });
  const products = Array.isArray(featuredData) ? featuredData : featuredData?.products || [];

  const { data: newProductsData, isLoading: newLoading } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => fetch('/api/products?new=true&limit=8').then((r) => r.json()),
  });
  const newArrivals = Array.isArray(newProductsData) ? newProductsData : newProductsData?.products || [];

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const { data: flashSaleData, isLoading: flashLoading } = useQuery<{
    items: FlashSaleItem[];
    endDate: string;
  }>({
    queryKey: ['flash-sale'],
    queryFn: () => fetch('/api/flash-sale').then((r) => r.json()),
  });

  // Fetch active promos for banner
  const { data: activePromos = [], isLoading: promosLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ['promos', 'active'],
    queryFn: () => fetch('/api/promos?active=true').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const promoBanners = activePromos.filter((p) => p.bannerText);
  const bannerBgClass = (bg: string) => {
    if (!bg) return 'from-rose-600 to-rose-500';
    return bg;
  };

  const getTypeLabel = (type: string, value: number) => {
    if (type === 'percentage') return `${value}% OFF`;
    if (type === 'fixed') return `Diskon ${formatRupiah(value)}`;
    if (type === 'shipping') return 'Potongan Ongkir';
    return '';
  };

  const categoryImages: Record<string, string> = {
    'fashion-wanita': '/images/categories/women.png',
    'fashion-pria': '/images/categories/men.png',
  };

  const getCategoryImage = (slug: string, index: number) => {
    if (categoryImages[slug]) return categoryImages[slug];
    const productImages = [
      '/images/products/dress-1.png',
      '/images/products/shirt-1.png',
      '/images/products/hijab-1.png',
      '/images/products/shoes-1.png',
      '/images/products/bag-1.png',
      '/images/products/watch-1.png',
      '/images/products/kids-1.png',
      '/images/products/acc-1.png',
    ];
    return productImages[index % productImages.length];
  };

  // Render a section based on its ID
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return renderHero();
      case 'categories':
        return renderCategories();
      case 'flash-sale':
        return renderFlashSale();
      case 'featured':
        return renderFeatured();
      case 'promo-banners':
        return renderPromoBanners();
      case 'new-arrivals':
        return renderNewArrivals();
      case 'testimonials':
        return renderTestimonials();
      case 'brands':
        return renderBrands();
      case 'newsletter':
        return renderNewsletter();
      default:
        return null;
    }
  };

  const renderHero = () => {
    const enabledSlides = heroSlides.filter((s) => s.enabled);
    if (enabledSlides.length === 0) return null;

    return (
      <section className="relative overflow-hidden">
        <div className={`grid ${enabledSlides.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {enabledSlides.map((slide) => (
            <div key={slide.id} className="relative aspect-[16/9] md:aspect-auto md:min-h-[500px]">
              <Image
                src={slide.image || '/images/banners/hero1.png'}
                alt={slide.badge || 'Banner'}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16">
                <Badge className={`mb-4 text-white ${slide.badgeColor}`}>{slide.badge}</Badge>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-md text-sm text-stone-200 md:text-base">
                  {slide.subtitle}
                </p>
                <Button
                  onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
                  className="mt-6 bg-white text-stone-900 hover:bg-stone-100"
                >
                  {slide.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCategories = () => (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Kategori</h2>
          <p className="mt-1 text-sm text-stone-500">Jelajahi produk berdasarkan kategori</p>
        </div>
        <button
          onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
          className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {categoriesLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.slice(0, 8).map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => {
                useNavigationStore.getState().setFilters({ category: cat.slug });
                navigate.navigate('shop');
                window.scrollTo(0, 0);
              }}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="relative aspect-square">
                <Image
                  src={getCategoryImage(cat.slug, index)}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-white md:text-base">{cat.name}</h3>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const renderFlashSale = () => {
    if (!flashSaleData?.items || flashSaleData.items.length === 0) return null;
    return (
      <section className="bg-gradient-to-r from-stone-900 to-stone-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">⚡ Flash Sale</h2>
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">HOT</Badge>
              </div>
              <p className="mt-1 text-sm text-stone-300">Stok terbatas, beli sekarang!</p>
            </div>
            <FlashSaleTimer endDate={flashSaleData.endDate} />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {flashLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[200px]">
                    <Skeleton className="h-64 rounded-xl" />
                  </div>
                ))
              : flashSaleData.items.map((item) => (
                  <Card key={item.id} className="min-w-[200px] flex-shrink-0 overflow-hidden border-0 bg-white/10 backdrop-blur">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={item.product?.images?.[0] || '/images/products/dress-1.png'}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                        {item.soldQty > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-rose-600 px-2 py-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
                              <div
                                className="h-full rounded-full bg-white"
                                style={{
                                  width: `${Math.min((item.soldQty / item.maxQty) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="mt-0.5 text-[10px] text-white">
                              Terjual {item.soldQty}/{item.maxQty}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-1 text-sm font-medium text-white">{item.product?.name}</h3>
                        <p className="mt-1 text-sm font-bold text-amber-400">
                          {formatRupiah(item.salePrice)}
                        </p>
                        {item.product?.comparePrice && (
                          <p className="text-xs text-stone-400 line-through">
                            {formatRupiah(item.product.comparePrice)}
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="mt-2 w-full bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => {
                            if (item.product) {
                              addItem({
                                productId: item.product.id,
                                name: item.product.name,
                                image: item.product.images?.[0] || '',
                                price: item.salePrice,
                                comparePrice: item.product.comparePrice,
                                quantity: 1,
                              });
                            }
                          }}
                        >
                          Tambah
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFeatured = () => (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Produk Unggulan</h2>
          <p className="mt-1 text-sm text-stone-500">Pilihan terbaik untuk Anda</p>
        </div>
        <button
          onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
          className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );

  const renderPromoBanners = () => {
    if (promoBanners.length === 0) return null;
    return (
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          {promoBanners.map((promo) => (
            <div
              key={promo.id as string}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bannerBgClass(promo.bannerBg as string)}`}
            >
              <div className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:px-16 md:py-12">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white md:text-4xl">
                    {promo.bannerText as string}
                  </h2>
                  {promo.bannerSubtext && (
                    <p className="mt-2 text-sm text-white/80 md:text-lg">
                      {promo.bannerSubtext as string}
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                      <Gift className="mr-1 h-3 w-3" />
                      {getTypeLabel(promo.type as string, promo.value as number)}
                    </Badge>
                    <span className="text-xs text-white/70 md:text-sm">
                      Kode: {promo.code as string}
                    </span>
                  </p>
                </div>
                <Button
                  size="lg"
                  className="border-2 border-white bg-white text-rose-600 hover:bg-rose-50 shrink-0"
                  onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
                >
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderNewArrivals = () => (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Baru Datang</h2>
          <p className="mt-1 text-sm text-stone-500">Produk terbaru koleksi kami</p>
        </div>
        <button
          onClick={() => {
            useNavigationStore.getState().setFilters({ sort: 'newest' });
            navigate.navigate('shop');
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {newLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[200px] aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[200px] flex-shrink-0 sm:min-w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderTestimonials = () => {
    if (testimonials.length === 0) return null;
    return (
      <section className="bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Apa Kata Mereka</h2>
            <p className="mt-1 text-sm text-stone-500">Testimoni dari pelanggan setia kami</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id} className="border-0 bg-white shadow-sm">
                <CardContent className="p-6">
                  <Quote className="mb-3 h-6 w-6 text-rose-200" />
                  <p className="text-sm leading-relaxed text-stone-600">{item.text}</p>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                      {item.avatar || item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {item.location ? `Pelanggan dari ${item.location}` : 'Pelanggan LUXE FASHION'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderBrands = () => {
    if (brands.length === 0) return null;
    return (
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Brand Partners</h2>
          <p className="mt-1 text-sm text-stone-500">Dipercaya oleh brand-brand ternama</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex h-12 items-center justify-center rounded-lg border border-stone-200 bg-white px-6 text-sm font-bold tracking-wider text-stone-400 transition-colors hover:border-rose-200 hover:text-stone-600"
            >
              {brand.name}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderNewsletter = () => (
    <section className="bg-stone-900 py-12">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Bergabung dengan LUXE FASHION</h2>
        <p className="mt-2 text-sm text-stone-400">
          Dapatkan promo eksklusif dan update koleksi terbaru langsung di inbox Anda.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('newsletter-email');
            if (email) {
              alert('Terima kasih telah berlangganan!');
            }
          }}
          className="mt-6 flex gap-2"
        >
          <input
            type="email"
            name="newsletter-email"
            placeholder="Masukkan email Anda"
            className="h-12 flex-1 rounded-lg border-0 bg-stone-800 px-4 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-600"
            required
          />
          <Button type="submit" size="lg" className="bg-rose-600 text-white hover:bg-rose-700">
            Langganan
          </Button>
        </form>
      </div>
    </section>
  );

  return (
    <div>
      {enabledSections.map((sectionId) => (
        <div key={sectionId}>{renderSection(sectionId)}</div>
      ))}
    </div>
  );
}
