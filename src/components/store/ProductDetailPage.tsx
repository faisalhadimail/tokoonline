'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Star,
  Heart,
  ShoppingBag,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import ProductCard from '@/components/store/ProductCard';
import { useNavigationStore, useCartStore, useWishlistStore } from '@/stores';
import { formatRupiah, getDiscountPercent, formatDate } from '@/lib/helpers';
import type { Product, Review } from '@/lib/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const selectedProductId = useNavigationStore((s) => s.selectedProductId);
  const navigate = useNavigationStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetch(`/api/products/${selectedProductId}`).then((r) => r.json()),
    enabled: !!selectedProductId,
  });

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ['products', 'related', product?.categories?.[0]?.category?.id],
    queryFn: () =>
      fetch(`/api/products?category=${product?.categories?.[0]?.category?.slug}&limit=4&exclude=${selectedProductId}`)
        .then((r) => r.json()),
    enabled: !!product?.categories?.[0]?.category?.slug,
  });
  const relatedProducts = Array.isArray(relatedData) ? relatedData : relatedData?.products || [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-2 text-sm text-stone-400">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-stone-900">Produk tidak ditemukan</h2>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
        >
          Kembali ke Shop
        </Button>
      </div>
    );
  }

  const discount = getDiscountPercent(product.price, product.comparePrice || 0);
  const isWishlisted = hasItem(product.id);
  const images = product.images?.length ? product.images : ['/images/products/dress-1.png'];
  const colors = [...new Set(product.variations?.map((v) => v.color).filter(Boolean) as string[])] || [];
  const sizes = [...new Set(product.variations?.map((v) => v.size).filter(Boolean) as string[])] || [];
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: images[selectedImage],
      price: product.price,
      comparePrice: product.comparePrice,
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      variationId: product.variations?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      )?.id,
    });
    toast.success('Produk ditambahkan ke keranjang');
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: images[selectedImage],
      price: product.price,
      comparePrice: product.comparePrice,
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      variationId: product.variations?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      )?.id,
    });
    navigate.navigate('checkout');
    window.scrollTo(0, 0);
  };

  const handleWhatsApp = () => {
    const text = `Halo, saya tertarik dengan produk ini:\n\n*${product.name}*\nHarga: ${formatRupiah(product.price)}\n\n${window.location.href}`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Review berhasil dikirim! (demo)');
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Shop
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <Badge className="absolute left-3 top-3 bg-rose-600 text-white hover:bg-rose-700">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="absolute left-3 top-3 mt-8 bg-emerald-500 text-white hover:bg-emerald-600">
                Baru
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === i ? 'border-rose-600' : 'border-stone-200'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">
              {avgRating.toFixed(1)} ({product._count?.reviews || 0} ulasan)
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-rose-600">
              {formatRupiah(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-stone-400 line-through">
                {formatRupiah(product.comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                Hemat {formatRupiah(product.comparePrice! - product.price)}
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          {/* Color */}
          {colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-stone-900">
                Warna: <span className="font-normal text-stone-500">{selectedColor || 'Pilih warna'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm transition-colors ${
                      selectedColor === color
                        ? 'border-rose-600 bg-rose-50 text-rose-600'
                        : 'border-stone-300 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-stone-900">
                Ukuran: <span className="font-normal text-stone-500">{selectedSize || 'Pilih ukuran'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-rose-600 bg-rose-50 text-rose-600'
                        : 'border-stone-300 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-stone-900">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-stone-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:text-stone-900"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-stone-500">
                Stok: {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2 bg-rose-600 text-white hover:bg-rose-700"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingBag className="h-5 w-5" />
              Tambah ke Keranjang
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-stone-300"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              <Check className="h-5 w-5" />
              Beli Sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-stone-300"
              onClick={() => toggleItem(product.id)}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-stone-300"
              onClick={handleWhatsApp}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-stone-50 p-3">
              <Truck className="h-5 w-5 text-rose-600" />
              <span className="text-[11px] text-stone-600">Pengiriman Cepat</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-stone-50 p-3">
              <Shield className="h-5 w-5 text-rose-600" />
              <span className="text-[11px] text-stone-600">Garansi Resmi</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-stone-50 p-3">
              <RotateCcw className="h-5 w-5 text-rose-600" />
              <span className="text-[11px] text-stone-600">30 Hari Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 data-[state=active]:shadow-none"
            >
              Deskripsi
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 data-[state=active]:shadow-none"
            >
              Ulasan ({product._count?.reviews || 0})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 data-[state=active]:shadow-none"
            >
              Pengiriman
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Review Form */}
              <div className="rounded-xl border border-stone-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-stone-900">Tulis Ulasan</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm text-stone-600">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                        >
                          <Star
                            className={`h-6 w-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    placeholder="Judul ulasan"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                  <Textarea
                    placeholder="Tulis ulasan Anda di sini..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="border-stone-300"
                  />
                  <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
                    Kirim Ulasan
                  </Button>
                </form>
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {(product.reviews || []).map((review) => (
                  <div key={review.id} className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                          {(review.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {review.user?.name || 'Pengguna'}
                          </p>
                          {review.isVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                              Terverifikasi
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-stone-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h4 className="mt-2 text-sm font-semibold text-stone-900">{review.title}</h4>
                    )}
                    <p className="mt-1 text-sm text-stone-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <div className="space-y-4 text-sm text-stone-600">
              <div className="rounded-xl border border-stone-200 p-6">
                <h3 className="mb-3 text-lg font-semibold text-stone-900">Informasi Pengiriman</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>Periksa promo ongkir di halaman checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>Pengiriman via JNE, J&T, SiCepat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>Estimasi pengiriman 2-5 hari kerja untuk Jawa, 5-10 hari untuk luar Jawa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>Packing aman dan rapi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RotateCcw className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>30 hari pengembalian jika barang cacat</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-stone-900">Produk Terkait</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
