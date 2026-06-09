'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores';
import ProductCard from '@/components/store/ProductCard';
import type { Product, Category } from '@/lib/types';

// Extract FiltersContent as a standalone component
function FiltersPanel({
  searchInput,
  onSearchChange,
  onSearch,
  categories,
  filters,
  onCategoryChange,
  priceRange,
  onPriceChange,
  activeFilterCount,
  onClearAll,
}: {
  searchInput: string;
  onSearchChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  categories: Category[];
  filters: Record<string, unknown>;
  onCategoryChange: (slug: string, checked: boolean) => void;
  priceRange: string;
  onPriceChange: (range: string) => void;
  activeFilterCount: number;
  onClearAll: () => void;
}) {
  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Cari produk..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 border-stone-300 pl-9"
          />
        </div>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">Kategori</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.category === cat.slug}
                onCheckedChange={(checked) => onCategoryChange(cat.slug, !!checked)}
              />
              <span className="text-sm text-stone-600">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">Rentang Harga</h3>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'Semua Harga' },
            { value: '0-200k', label: '< Rp 200.000' },
            { value: '200k-500k', label: 'Rp 200.000 - 500.000' },
            { value: '500k-1m', label: 'Rp 500.000 - 1.000.000' },
            { value: '1m+', label: '> Rp 1.000.000' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={priceRange === opt.value}
                onChange={() => onPriceChange(opt.value)}
                className="h-4 w-4 accent-rose-600"
              />
              <span className="text-sm text-stone-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" className="w-full border-stone-300" onClick={onClearAll}>
          Hapus Semua Filter
        </Button>
      )}
    </div>
  );
}

export default function ShopPage() {
  const navigate = useNavigationStore();
  const filters = useNavigationStore((s) => s.filters);
  const setFilters = useNavigationStore((s) => s.setFilters);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<'all' | '0-200k' | '200k-500k' | '500k-1m' | '1m+'>('all');

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.minPrice) params.minPrice = String(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = String(filters.maxPrice);
    params.page = String(filters.page || 1);
    params.limit = '12';
    return params;
  }, [filters]);

  const { data, isLoading } = useQuery<{ products: Product[]; total: number; pages: number }>({
    queryKey: ['products', queryParams],
    queryFn: () => fetch('/api/products?' + new URLSearchParams(queryParams)).then((r) => r.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const products = data?.products || [];
  const totalPages = data?.pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput || undefined, page: 1 });
  };

  const handleCategoryChange = (slug: string, checked: boolean) => {
    setFilters({ ...filters, category: checked ? slug : undefined, page: 1 });
  };

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sort: value || undefined, page: 1 });
  };

  const handlePriceChange = (range: string) => {
    setPriceRange(range as typeof priceRange);
    const priceMap: Record<string, { min?: number; max?: number }> = {
      all: {},
      '0-200k': { max: 200000 },
      '200k-500k': { min: 200000, max: 500000 },
      '500k-1m': { min: 500000, max: 1000000 },
      '1m+': { min: 1000000 },
    };
    const p = priceMap[range] || {};
    setFilters({ ...filters, minPrice: p.min, maxPrice: p.max, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const activeFilterCount = [
    filters.category,
    filters.minPrice || filters.maxPrice,
    filters.search,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchInput('');
    setPriceRange('all');
    useNavigationStore.getState().clearFilters();
  };

  const filterProps = {
    searchInput,
    onSearchChange: setSearchInput,
    onSearch: handleSearch,
    categories,
    filters: filters as Record<string, unknown>,
    onCategoryChange: handleCategoryChange,
    priceRange,
    onPriceChange: handlePriceChange,
    activeFilterCount,
    onClearAll: clearAllFilters,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Shop</span>
      </nav>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <h2 className="mb-4 text-lg font-bold text-stone-900">Filter</h2>
          <FiltersPanel {...filterProps} />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-stone-300 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 rounded-full bg-rose-600 p-0 text-[10px] text-white">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-6">
                  <SheetTitle className="text-lg font-bold text-stone-900">Filter</SheetTitle>
                  <div className="mt-4">
                    <FiltersPanel {...filterProps} />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-stone-500">
                Menampilkan {products.length} produk
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-9 w-48 border-stone-300 pl-9"
                  />
                </div>
              </form>

              <Select value={filters.sort || ''} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 w-40 border-stone-300">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price-asc">Harga: Rendah-Tinggi</SelectItem>
                  <SelectItem value="price-desc">Harga: Tinggi-Rendah</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Kategori: {filters.category}
                  <button onClick={() => setFilters({ ...filters, category: undefined, page: 1 })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Cari: &quot;{filters.search}&quot;
                  <button onClick={() => { setSearchInput(''); setFilters({ ...filters, search: undefined, page: 1 }); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {priceRange !== 'all' && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Harga: {priceRange}
                  <button onClick={() => handlePriceChange('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <PackageX className="h-16 w-16 text-stone-300" />
              <h3 className="mt-4 text-lg font-semibold text-stone-900">Produk tidak ditemukan</h3>
              <p className="mt-2 text-sm text-stone-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
              <Button
                className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
                onClick={clearAllFilters}
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-stone-300"
                disabled={(filters.page || 1) <= 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={(filters.page || 1) === page ? 'default' : 'outline'}
                    size="icon"
                    className={(filters.page || 1) === page ? 'bg-rose-600 text-white hover:bg-rose-700' : 'h-9 w-9 border-stone-300'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-stone-300"
                disabled={(filters.page || 1) >= totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
