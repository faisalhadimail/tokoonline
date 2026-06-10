'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  LayoutGrid,
  Quote,
  Star,
  Plus,
  Trash2,
  Save,
  GripVertical,
  Loader2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  X,
  MonitorSmartphone,
  Type,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

interface HomepageSettingsData {
  heroSlides: HeroSlide[];
  homepageSections: HomepageSection[];
  testimonialsData: TestimonialItem[];
  brandPartners: BrandPartner[];
}

// ==================== DEFAULTS ====================
const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: 'hero', label: 'Hero Banner', enabled: true, order: 0 },
  { id: 'categories', label: 'Kategori', enabled: true, order: 1 },
  { id: 'flash-sale', label: 'Flash Sale', enabled: true, order: 2 },
  { id: 'featured', label: 'Produk Unggulan', enabled: true, order: 3 },
  { id: 'promo-banners', label: 'Banner Promo', enabled: true, order: 4 },
  { id: 'new-arrivals', label: 'Baru Datang', enabled: true, order: 5 },
  { id: 'testimonials', label: 'Testimoni', enabled: true, order: 6 },
  { id: 'brands', label: 'Brand Partners', enabled: true, order: 7 },
  { id: 'newsletter', label: 'Newsletter', enabled: true, order: 8 },
];

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

const BADGE_COLORS = [
  { label: 'Rose', value: 'bg-rose-600 hover:bg-rose-700' },
  { label: 'Amber', value: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Emerald', value: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Violet', value: 'bg-violet-600 hover:bg-violet-700' },
  { label: 'Sky', value: 'bg-sky-600 hover:bg-sky-700' },
  { label: 'Orange', value: 'bg-orange-500 hover:bg-orange-600' },
];

// ==================== MAIN COMPONENT ====================
export default function HomepageSettings() {
  const [activeSection, setActiveSection] = useState('hero');

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
  });

  // Mutation to save settings
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success('Pengaturan homepage berhasil disimpan!');
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan homepage');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pengaturan Homepage</h3>
          <p className="text-sm text-gray-500">Kelola tampilan dan konten halaman depan</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Derive data with defaults
  const heroSlides: HeroSlide[] = Array.isArray(settings?.heroSlides) && (settings.heroSlides as unknown[]).length > 0
    ? settings.heroSlides as HeroSlide[]
    : DEFAULT_HERO_SLIDES;

  const homepageSections: HomepageSection[] = Array.isArray(settings?.homepageSections) && (settings.homepageSections as unknown[]).length > 0
    ? settings.homepageSections as HomepageSection[]
    : DEFAULT_SECTIONS;

  const testimonialsData: TestimonialItem[] = Array.isArray(settings?.testimonialsData) && (settings.testimonialsData as unknown[]).length > 0
    ? settings.testimonialsData as TestimonialItem[]
    : DEFAULT_TESTIMONIALS;

  const brandPartners: BrandPartner[] = Array.isArray(settings?.brandPartners) && (settings.brandPartners as unknown[]).length > 0
    ? settings.brandPartners as BrandPartner[]
    : DEFAULT_BRANDS;

  const navCards = [
    { id: 'hero', label: 'Hero Banner', icon: ImageIcon, desc: 'Slide utama', count: heroSlides.length },
    { id: 'sections', label: 'Seksi Halaman', icon: LayoutGrid, desc: 'Visibilitas & urutan', count: homepageSections.filter(s => s.enabled).length },
    { id: 'testimonials', label: 'Testimoni', icon: Quote, desc: 'Ulasan pelanggan', count: testimonialsData.length },
    { id: 'brands', label: 'Brand Partners', icon: Star, desc: 'Daftar brand', count: brandPartners.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pengaturan Homepage</h3>
          <p className="text-sm text-gray-500">Kelola tampilan dan konten halaman depan toko Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
            Aktif
          </Badge>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {navCards.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isActive
                  ? 'border-rose-500 bg-rose-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${isActive ? 'text-rose-500' : 'text-gray-400'}`} />
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {item.count}
                </Badge>
              </div>
              <p className={`text-sm font-semibold ${isActive ? 'text-rose-700' : 'text-gray-900'}`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-2">
        {activeSection === 'hero' && (
          <HeroSlidesManager
            initialSlides={heroSlides}
            onSave={(slides) => saveMutation.mutate({ heroSlides: slides })}
            isSaving={saveMutation.isPending}
          />
        )}
        {activeSection === 'sections' && (
          <SectionsManager
            initialSections={homepageSections}
            onSave={(sections) => saveMutation.mutate({ homepageSections: sections })}
            isSaving={saveMutation.isPending}
          />
        )}
        {activeSection === 'testimonials' && (
          <TestimonialsManager
            initialTestimonials={testimonialsData}
            onSave={(data) => saveMutation.mutate({ testimonialsData: data })}
            isSaving={saveMutation.isPending}
          />
        )}
        {activeSection === 'brands' && (
          <BrandsManager
            initialBrands={brandPartners}
            onSave={(data) => saveMutation.mutate({ brandPartners: data })}
            isSaving={saveMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// ==================== HERO SLIDES MANAGER ====================
function HeroSlidesManager({
  initialSlides,
  onSave,
  isSaving,
}: {
  initialSlides: HeroSlide[];
  onSave: (slides: HeroSlide[]) => void;
  isSaving: boolean;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `h-${Date.now()}`,
      title: 'Judul Baru',
      subtitle: 'Deskripsi singkat untuk banner Anda.',
      badge: 'Badge',
      badgeColor: 'bg-rose-600 hover:bg-rose-700',
      buttonText: 'Belanja Sekarang',
      image: '/images/banners/hero1.png',
      enabled: true,
    };
    setSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string | boolean) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const toggleSlide = (id: string) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Hero Banner</h4>
          <p className="text-sm text-gray-500">Kelola slide banner utama di halaman depan</p>
        </div>
        <Button onClick={addSlide} size="sm" className="bg-rose-500 hover:bg-rose-600">
          <Plus className="h-4 w-4 mr-1" />
          Tambah Slide
        </Button>
      </div>

      {slides.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-700 mb-1">Belum ada slide</h4>
            <p className="text-sm text-gray-400">Tambahkan slide banner untuk homepage Anda</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className={!slide.enabled ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <Badge variant="secondary" className="text-xs">
                    Slide {index + 1}
                  </Badge>
                  {!slide.enabled && (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Tersembunyi
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleSlide(slide.id)}
                    title={slide.enabled ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {slide.enabled ? (
                      <Eye className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => removeSlide(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                  >
                    {editingId === slide.id ? 'Tutup' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Preview */}
              <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-r from-gray-800 to-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-start justify-center px-6">
                    <Badge className={`mb-2 text-white text-xs ${slide.badgeColor}`}>{slide.badge}</Badge>
                    <h3 className="text-xl font-bold text-white whitespace-pre-line">{slide.title}</h3>
                    <p className="mt-1 text-xs text-stone-300 max-w-xs line-clamp-2">{slide.subtitle}</p>
                    <Button size="sm" className="mt-3 bg-white text-stone-900 hover:bg-stone-100 text-xs h-8">
                      {slide.buttonText}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Edit form */}
              {editingId === slide.id && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-gray-400" />
                        Judul
                      </Label>
                      <Textarea
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                        rows={2}
                        placeholder="Judul banner (gunakan \n untuk baris baru)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subjudul</Label>
                      <Textarea
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                        rows={2}
                        placeholder="Deskripsi singkat"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Badge Text</Label>
                      <Input
                        value={slide.badge}
                        onChange={(e) => updateSlide(slide.id, 'badge', e.target.value)}
                        placeholder="e.g. Flash Sale"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-gray-400" />
                        Warna Badge
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {BADGE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateSlide(slide.id, 'badgeColor', color.value)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-medium text-white ${color.value} ${
                              slide.badgeColor === color.value ? 'ring-2 ring-offset-2 ring-rose-500' : ''
                            }`}
                          >
                            {color.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tombol Text</Label>
                      <Input
                        value={slide.buttonText}
                        onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                        placeholder="Belanja Sekarang"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <MonitorSmartphone className="h-3.5 w-3.5 text-gray-400" />
                      URL Gambar
                    </Label>
                    <Input
                      value={slide.image}
                      onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                      placeholder="/images/banners/hero1.png"
                    />
                    <p className="text-xs text-gray-400">
                      Ukuran rekomendasi: 1200x600px (landscape)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save */}
      {slides.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(slides)} disabled={isSaving} className="bg-rose-500 hover:bg-rose-600">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Hero Banner
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== SECTIONS MANAGER ====================
function SectionsManager({
  initialSections,
  onSave,
  isSaving,
}: {
  initialSections: HomepageSection[];
  onSave: (sections: HomepageSection[]) => void;
  isSaving: boolean;
}) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);

  const toggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    // Recalculate order
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
  };

  const handleSave = () => {
    const ordered = sections.map((s, i) => ({ ...s, order: i }));
    onSave(ordered);
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'hero': return <ImageIcon className="h-4 w-4" />;
      case 'categories': return <LayoutGrid className="h-4 w-4" />;
      case 'flash-sale': return <span className="text-xs">⚡</span>;
      case 'featured': return <Star className="h-4 w-4" />;
      case 'promo-banners': return <span className="text-xs">🏷️</span>;
      case 'new-arrivals': return <span className="text-xs">🆕</span>;
      case 'testimonials': return <Quote className="h-4 w-4" />;
      case 'brands': return <span className="text-xs">🏢</span>;
      case 'newsletter': return <span className="text-xs">📧</span>;
      default: return <LayoutGrid className="h-4 w-4" />;
    }
  };

  const enabledCount = sections.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-semibold text-gray-900">Seksi Halaman</h4>
        <p className="text-sm text-gray-500">Atur visibilitas dan urutan setiap seksi di homepage. Aktif: {enabledCount}/{sections.length}</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  !section.enabled ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">
                    {index + 1}
                  </span>
                  <span className="text-gray-500">{getSectionIcon(section.id)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {section.label}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-rose-500 hover:bg-rose-600">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Urutan & Visibilitas
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ==================== TESTIMONIALS MANAGER ====================
function TestimonialsManager({
  initialTestimonials,
  onSave,
  isSaving,
}: {
  initialTestimonials: TestimonialItem[];
  onSave: (data: TestimonialItem[]) => void;
  isSaving: boolean;
}) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTestimonial = () => {
    const newItem: TestimonialItem = {
      id: `t-${Date.now()}`,
      name: '',
      avatar: '',
      rating: 5,
      text: '',
      location: '',
    };
    setTestimonials([...testimonials, newItem]);
    setEditingId(newItem.id);
  };

  const removeTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateTestimonial = (id: string, field: keyof TestimonialItem, value: string | number) => {
    setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Testimoni Pelanggan</h4>
          <p className="text-sm text-gray-500">Kelola testimoni yang ditampilkan di homepage</p>
        </div>
        <Button onClick={addTestimonial} size="sm" className="bg-rose-500 hover:bg-rose-600">
          <Plus className="h-4 w-4 mr-1" />
          Tambah Testimoni
        </Button>
      </div>

      {testimonials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Quote className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-700 mb-1">Belum ada testimoni</h4>
            <p className="text-sm text-gray-400">Tambahkan testimoni dari pelanggan Anda</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              {/* Preview */}
              <div className="mb-3 p-3 rounded-lg bg-stone-50">
                <Quote className="h-4 w-4 text-rose-200 mb-2" />
                <p className="text-xs text-stone-600 line-clamp-3">{item.text || 'Belum ada teks...'}</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">
                    {item.avatar || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-900">{item.name || 'Nama...'}</p>
                    {item.location && <p className="text-[10px] text-stone-400">{item.location}</p>}
                  </div>
                </div>
              </div>

              {/* Edit form */}
              {editingId === item.id ? (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label className="text-xs">Nama</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateTestimonial(item.id, 'name', e.target.value)}
                      placeholder="Nama pelanggan"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Inisial Avatar</Label>
                      <Input
                        value={item.avatar}
                        onChange={(e) => updateTestimonial(item.id, 'avatar', e.target.value)}
                        placeholder="SD"
                        maxLength={2}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Lokasi</Label>
                      <Input
                        value={item.location}
                        onChange={(e) => updateTestimonial(item.id, 'location', e.target.value)}
                        placeholder="Jakarta"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateTestimonial(item.id, 'rating', r)}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              r <= item.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Teks Testimoni</Label>
                    <Textarea
                      value={item.text}
                      onChange={(e) => updateTestimonial(item.id, 'text', e.target.value)}
                      rows={2}
                      placeholder="Tulis testimoni..."
                      className="text-sm"
                    />
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                >
                  {editingId === item.id ? 'Tutup' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => removeTestimonial(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save */}
      {testimonials.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(testimonials)} disabled={isSaving} className="bg-rose-500 hover:bg-rose-600">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Testimoni
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== BRANDS MANAGER ====================
function BrandsManager({
  initialBrands,
  onSave,
  isSaving,
}: {
  initialBrands: BrandPartner[];
  onSave: (data: BrandPartner[]) => void;
  isSaving: boolean;
}) {
  const [brands, setBrands] = useState<BrandPartner[]>(initialBrands);
  const [newBrandName, setNewBrandName] = useState('');

  const addBrand = () => {
    if (!newBrandName.trim()) return;
    const newBrand: BrandPartner = {
      id: `b-${Date.now()}`,
      name: newBrandName.trim().toUpperCase(),
      enabled: true,
    };
    setBrands([...brands, newBrand]);
    setNewBrandName('');
  };

  const removeBrand = (id: string) => {
    setBrands(brands.filter((b) => b.id !== id));
  };

  const toggleBrand = (id: string) => {
    setBrands(brands.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  const updateBrandName = (id: string, name: string) => {
    setBrands(brands.map((b) => (b.id === id ? { ...b, name } : b)));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-semibold text-gray-900">Brand Partners</h4>
        <p className="text-sm text-gray-500">Kelola daftar brand yang ditampilkan di homepage</p>
      </div>

      {/* Add Brand */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBrand()}
              placeholder="Nama brand baru..."
              className="flex-1"
            />
            <Button onClick={addBrand} size="sm" className="bg-rose-500 hover:bg-rose-600 shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brand list */}
      {brands.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-700 mb-1">Belum ada brand</h4>
            <p className="text-sm text-gray-400">Tambahkan brand partner Anda</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    !brand.enabled ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500 shrink-0">
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    {brand.enabled ? (
                      <div className="flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-bold tracking-wider text-stone-500 transition-colors">
                        {brand.name}
                      </div>
                    ) : (
                      <Input
                        value={brand.name}
                        onChange={(e) => updateBrandName(brand.id, e.target.value)}
                        className="h-9 text-sm font-bold tracking-wider"
                        placeholder="Nama brand"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={brand.enabled}
                      onCheckedChange={() => toggleBrand(brand.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => removeBrand(brand.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {brands.filter((b) => b.enabled).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {brands
                .filter((b) => b.enabled)
                .map((brand) => (
                  <div
                    key={brand.id}
                    className="flex h-10 items-center justify-center rounded-lg border border-stone-200 bg-white px-4 text-xs font-bold tracking-wider text-stone-400 transition-colors hover:border-rose-200 hover:text-stone-600"
                  >
                    {brand.name}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save */}
      {brands.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(brands)} disabled={isSaving} className="bg-rose-500 hover:bg-rose-600">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Brand Partners
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
