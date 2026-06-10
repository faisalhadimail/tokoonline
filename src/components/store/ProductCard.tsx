'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores';
import { useWishlistStore } from '@/stores';
import { useNavigationStore } from '@/stores';
import { formatRupiah, getDiscountPercent } from '@/lib/helpers';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const navigate = useNavigationStore((s) => s.navigate);

  const isWishlisted = hasItem(product.id);
  const discount = getDiscountPercent(product.price, product.comparePrice || 0);
  const mainImage = product.images?.[0] || '/images/products/dress-1.png';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      image: mainImage,
      price: product.price,
      comparePrice: product.comparePrice,
      quantity: 1,
      color: product.variations?.[0]?.color,
      size: product.variations?.[0]?.size,
      variationId: product.variations?.[0]?.id,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist');
  };

  const handleClick = () => {
    navigate('product', product.id);
  };

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-stone-200 transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
    >
      <CardContent className="relative p-0">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-stone-200" />
          )}
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-rose-600 text-xs text-white hover:bg-rose-700">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-emerald-500 text-xs text-white hover:bg-emerald-600">
                Baru
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={handleWishlist}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-600'}`}
            />
          </Button>

          {/* Quick add to cart */}
          <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              size="sm"
              className="w-full gap-2 bg-stone-900 text-white hover:bg-stone-800"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              Keranjang
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-stone-800">
            {product.name}
          </h3>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                />
              ))}
              <span className="ml-1 text-xs text-stone-500">
                ({product._count?.reviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex flex-col gap-0.5">
            <span className="text-sm font-bold text-rose-600">
              {formatRupiah(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                {formatRupiah(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
