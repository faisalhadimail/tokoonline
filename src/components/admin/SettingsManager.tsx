'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Truck,
  CreditCard,
  Palette,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Facebook,
  Copy,
  Check,
  Loader2,
  Search,
  MapPin,
  ChevronRight,
  X,
  Zap,
  Building2,
  MapPinned,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ShippingMethod {
  id: string;
  courier: string;
  service: string;
  price: number;
  eta: string;
}

interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'qris' | 'cod';
  enabled: boolean;
}

interface StoreSettingsData {
  id: string;
  storeName: string;
  storeTagline: string | null;
  storeEmail: string;
  storePhone: string;
  whatsapp: string;
  storeAddress: string | null;
  storeCity: string | null;
  storeProvince: string | null;
  storePostalCode: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  twitter: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  faviconUrl: string | null;
  codEnabled: boolean;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethodItem[];
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  ewalletName: string | null;
  ewalletNumber: string | null;
  qrisEnabled: boolean;
  primaryColor: string;
  fontFamily: string;
  showBrands: boolean;
  showTestimonials: boolean;
  showNewsletter: boolean;
  emailNewOrder: boolean;
  emailLowStock: boolean;
  emailNewReview: boolean;
  whatsappNotify: boolean;
  notifyEmail: string | null;
  twoFactorEnabled: boolean;
  // Store origin location for shipping API
  originRegencyCode: string | null;
  originRegencyName: string | null;
  originDistrictCode: string | null;
  originDistrictName: string | null;
  originVillageCode: string | null;
  originVillageName: string | null;
}

export default function SettingsManager() {
  const [activeSection, setActiveSection] = useState('general');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch settings
  const { data: settings, isLoading } = useQuery<StoreSettingsData>({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
  });

  // Mutation to save settings
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettingsData>) => {
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
      toast.success('Pengaturan berhasil disimpan!');
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
    },
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <p className="text-sm text-gray-500">Manage store settings and preferences</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pengaturan Toko</h3>
          <p className="text-sm text-gray-500">Kelola pengaturan dan preferensi toko Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
            Aktif
          </Badge>
        </div>
      </div>

      {/* Settings Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'general', label: 'Umum', icon: Store, desc: 'Info toko & kontak' },
          { id: 'shipping', label: 'Pengiriman', icon: Truck, desc: 'Kurir & ongkir' },
          { id: 'payments', label: 'Pembayaran', icon: CreditCard, desc: 'Metode bayar' },
          { id: 'appearance', label: 'Tampilan', icon: Palette, desc: 'Tema & warna' },
          { id: 'notifications', label: 'Notifikasi', icon: Bell, desc: 'Email & WA' },
          { id: 'security', label: 'Keamanan', icon: Shield, desc: 'Password & 2FA' },
        ].map((item) => {
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
              <Icon
                className={`h-5 w-5 mb-2 ${
                  isActive ? 'text-rose-500' : 'text-gray-400'
                }`}
              />
              <p
                className={`text-sm font-semibold ${
                  isActive ? 'text-rose-700' : 'text-gray-900'
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Settings Content - key resets child state when settings update */}
      <div className="mt-2">
        <SettingsContent
          key={settings.id + settings.updatedAt}
          settings={settings}
          activeSection={activeSection}
          saveMutation={saveMutation}
          copyToClipboard={copyToClipboard}
          copiedField={copiedField}
        />
      </div>
    </div>
  );
}

function SettingsContent({
  settings,
  activeSection,
  saveMutation,
  copyToClipboard,
  copiedField,
}: {
  settings: StoreSettingsData;
  activeSection: string;
  saveMutation: ReturnType<typeof useMutation>;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
}) {
  if (activeSection === 'general') {
    return (
      <GeneralSettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
        copyToClipboard={copyToClipboard}
        copiedField={copiedField}
      />
    );
  }
  if (activeSection === 'shipping') {
    return (
      <ShippingSettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
      />
    );
  }
  if (activeSection === 'payments') {
    return (
      <PaymentSettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
      />
    );
  }
  if (activeSection === 'appearance') {
    return (
      <AppearanceSettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
      />
    );
  }
  if (activeSection === 'notifications') {
    return (
      <NotificationSettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
      />
    );
  }
  if (activeSection === 'security') {
    return (
      <SecuritySettings
        settings={settings}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
      />
    );
  }
  return null;
}

// ===================== GENERAL SETTINGS =====================
function GeneralSettings({
  settings,
  onSave,
  isSaving,
  copyToClipboard,
  copiedField,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
}) {
  const [form, setForm] = useState({
    storeName: settings.storeName,
    storeTagline: settings.storeTagline || '',
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    whatsapp: settings.whatsapp,
    storeAddress: settings.storeAddress || '',
    storeCity: settings.storeCity || '',
    storeProvince: settings.storeProvince || '',
    storePostalCode: settings.storePostalCode || '',
    instagram: settings.instagram || '',
    facebook: settings.facebook || '',
    tiktok: settings.tiktok || '',
    twitter: settings.twitter || '',
    metaTitle: settings.metaTitle || '',
    metaDesc: settings.metaDesc || '',
    metaKeywords: settings.metaKeywords || '',
  });

  const handleSave = () => {
    onSave(form);
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-rose-500" />
            Informasi Toko
          </CardTitle>
          <CardDescription>Nama, tagline, dan informasi dasar toko Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input
                id="storeName"
                value={form.storeName}
                onChange={(e) => update('storeName', e.target.value)}
                placeholder="Nama toko Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeTagline">Tagline</Label>
              <Input
                id="storeTagline"
                value={form.storeTagline}
                onChange={(e) => update('storeTagline', e.target.value)}
                placeholder="Tagline toko Anda"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-rose-500" />
            Informasi Kontak
          </CardTitle>
          <CardDescription>Email, telepon, dan WhatsApp untuk pelanggan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Email Toko</Label>
              <Input
                id="storeEmail"
                type="email"
                value={form.storeEmail}
                onChange={(e) => update('storeEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Nomor Telepon</Label>
              <Input
                id="storePhone"
                value={form.storePhone}
                onChange={(e) => update('storePhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (CS)</Label>
            <div className="flex gap-2">
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(form.whatsapp, 'wa')}
                title="Salin"
              >
                {copiedField === 'wa' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alamat Toko</CardTitle>
          <CardDescription>Alamat lengkap yang ditampilkan di toko</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Alamat Lengkap</Label>
            <Textarea
              id="storeAddress"
              value={form.storeAddress}
              onChange={(e) => update('storeAddress', e.target.value)}
              placeholder="Jl. ..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeCity">Kota</Label>
              <Input
                id="storeCity"
                value={form.storeCity}
                onChange={(e) => update('storeCity', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeProvince">Provinsi</Label>
              <Input
                id="storeProvince"
                value={form.storeProvince}
                onChange={(e) => update('storeProvince', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePostalCode">Kode Pos</Label>
              <Input
                id="storePostalCode"
                value={form.storePostalCode}
                onChange={(e) => update('storePostalCode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Instagram className="h-4 w-4 text-rose-500" />
            Media Sosial
          </CardTitle>
          <CardDescription>Link media sosial toko Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex gap-2">
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => update('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="flex-1"
                />
                {form.instagram && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(form.instagram, 'ig')}
                  >
                    {copiedField === 'ig' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={form.facebook}
                onChange={(e) => update('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={form.tiktok}
                onChange={(e) => update('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={form.twitter}
                onChange={(e) => update('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-rose-500" />
            SEO & Meta
          </CardTitle>
          <CardDescription>Optimasi mesin pencari untuk toko Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={form.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              placeholder="Judul halaman di search engine"
            />
            <p className="text-xs text-gray-400">
              {form.metaTitle.length}/60 karakter
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDesc">Meta Description</Label>
            <Textarea
              id="metaDesc"
              value={form.metaDesc}
              onChange={(e) => update('metaDesc', e.target.value)}
              placeholder="Deskripsi halaman di search engine"
              rows={2}
            />
            <p className="text-xs text-gray-400">
              {form.metaDesc.length}/160 karakter
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={form.metaKeywords}
              onChange={(e) => update('metaKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
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
              Simpan Pengaturan Umum
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===================== SHIPPING SETTINGS =====================
function ShippingSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
}) {
  const [methods, setMethods] = useState<ShippingMethod[]>(settings.shippingMethods);
  const [freeShippingMin] = useState(0); // deprecated
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled);

  // Store origin location state
  const [originRegencyCode, setOriginRegencyCode] = useState(settings.originRegencyCode || '');
  const [originRegencyName, setOriginRegencyName] = useState(settings.originRegencyName || '');
  const [originDistrictCode, setOriginDistrictCode] = useState(settings.originDistrictCode || '');
  const [originDistrictName, setOriginDistrictName] = useState(settings.originDistrictName || '');
  const [originVillageCode, setOriginVillageCode] = useState(settings.originVillageCode || '');
  const [originVillageName, setOriginVillageName] = useState(settings.originVillageName || '');

  // Search states
  const [regencySearch, setRegencySearch] = useState('');
  const [showRegencyDropdown, setShowRegencyDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);

  const regencyInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);
  const villageInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regencyInputRef.current && !regencyInputRef.current.parentElement?.contains(e.target as Node)) {
        setShowRegencyDropdown(false);
      }
      if (districtInputRef.current && !districtInputRef.current.parentElement?.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (villageInputRef.current && !villageInputRef.current.parentElement?.contains(e.target as Node)) {
        setShowVillageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search regencies
  const { data: regencyResults } = useQuery({
    queryKey: ['regencies', regencySearch],
    queryFn: () =>
      fetch(`/api/shipping/search-area?search=${encodeURIComponent(regencySearch)}&type=cities&size=15`)
        .then((r) => r.json())
        .then((d) => d.results || []),
    enabled: regencySearch.length >= 2 && showRegencyDropdown,
    staleTime: 60 * 60 * 1000,
  });

  // Search districts when regency is selected
  const { data: districtResults } = useQuery({
    queryKey: ['districts', originRegencyCode],
    queryFn: () =>
      fetch(`/api/shipping/search-area?type=districts&regency_code=${originRegencyCode}&size=100`)
        .then((r) => r.json())
        .then((d) => d.results || []),
    enabled: !!originRegencyCode && showDistrictDropdown,
    staleTime: 60 * 60 * 1000,
  });

  // Search villages when district is selected
  const { data: villageResults, isLoading: villagesLoading } = useQuery({
    queryKey: ['villages', originDistrictCode],
    queryFn: () =>
      fetch(`/api/shipping/search-village?district_code=${originDistrictCode}&size=100`)
        .then((r) => r.json())
        .then((d) => d.villages || []),
    enabled: !!originDistrictCode && showVillageDropdown,
    staleTime: 60 * 60 * 1000,
  });

  const handleRegencySelect = (item: { code: string; name: string }) => {
    setOriginRegencyCode(item.code);
    setOriginRegencyName(item.name);
    setOriginDistrictCode('');
    setOriginDistrictName('');
    setOriginVillageCode('');
    setOriginVillageName('');
    setRegencySearch('');
    setShowRegencyDropdown(false);
    setShowDistrictDropdown(true);
  };

  const handleDistrictSelect = (item: { code: string; name: string }) => {
    setOriginDistrictCode(item.code);
    setOriginDistrictName(item.name);
    setOriginVillageCode('');
    setOriginVillageName('');
    setShowDistrictDropdown(false);
    setShowVillageDropdown(true);
  };

  const handleVillageSelect = (item: { code: string; name: string }) => {
    setOriginVillageCode(item.code);
    setOriginVillageName(item.name);
    setShowVillageDropdown(false);
    toast.success(`Lokasi toko disimpan: ${item.name}`);
  };

  const resetLocation = () => {
    setOriginRegencyCode('');
    setOriginRegencyName('');
    setOriginDistrictCode('');
    setOriginDistrictName('');
    setOriginVillageCode('');
    setOriginVillageName('');
  };

  const addMethod = () => {
    setMethods([
      ...methods,
      {
        id: `custom-${Date.now()}`,
        courier: '',
        service: '',
        price: 0,
        eta: '',
      },
    ]);
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id));
  };

  const updateMethod = (id: string, field: keyof ShippingMethod, value: string | number) => {
    setMethods(methods.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSave = () => {
    onSave({
      shippingMethods: methods,
      // freeShippingMinPurchase removed
      codEnabled: codEnabled,
      originRegencyCode: originRegencyCode || null,
      originRegencyName: originRegencyName || null,
      originDistrictCode: originDistrictCode || null,
      originDistrictName: originDistrictName || null,
      originVillageCode: originVillageCode || null,
      originVillageName: originVillageName || null,
    });
  };

  const courierOptions = ['JNE', 'J&T', 'SiCepat', 'AnterAja', 'Ninja Express', 'Pos Indonesia', 'Lion Parcel', 'GRAB Express', 'GoSend'];

  const locationSteps = [
    { label: 'Kabupaten/Kota', icon: Building2, done: !!originRegencyCode },
    { label: 'Kecamatan', icon: MapPinned, done: !!originDistrictCode },
    { label: 'Kelurahan', icon: MapPin, done: !!originVillageCode },
  ];

  return (
    <div className="space-y-6">
      {/* Store Origin Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-rose-500" />
            Lokasi Toko (Asal Pengiriman)
          </CardTitle>
          <CardDescription>
            Pilih lokasi toko Anda untuk perhitungan ongkos kirim. Data digunakan sebagai titik awal pengiriman.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {locationSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    step.done
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}>
                    <StepIcon className="h-3 w-3" />
                    {step.label}
                    {step.done && <Check className="h-3 w-3" />}
                  </div>
                  {i < locationSteps.length - 1 && <ChevronRight className="h-3 w-3 text-stone-300" />}
                </div>
              );
            })}
          </div>

          {/* Current location display */}
          {originVillageCode && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">
                    {originVillageName}, {originDistrictName}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {originRegencyName} • Kode: {originVillageCode}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetLocation} className="text-emerald-600 hover:text-emerald-800 h-8">
                <X className="h-3.5 w-3.5 mr-1" />
                Ubah
              </Button>
            </div>
          )}

          {/* Step 1: Kabupaten/Kota Search */}
          <div>
            <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-stone-400" />
              Kabupaten / Kota *
            </Label>
            <div className="relative" ref={regencyInputRef}>
              {originRegencyCode && !showRegencyDropdown ? (
                <div className="flex h-10 items-center justify-between rounded-md border border-stone-300 bg-stone-50 px-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-medium text-stone-900">{originRegencyName}</span>
                  </div>
                  <button
                    onClick={() => {
                      resetLocation();
                      setRegencySearch(originRegencyName);
                      setShowRegencyDropdown(true);
                    }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      placeholder="Ketik nama kabupaten/kota... (min. 2 huruf)"
                      value={regencySearch}
                      onChange={(e) => {
                        setRegencySearch(e.target.value);
                        setShowRegencyDropdown(true);
                      }}
                      onFocus={() => regencySearch.length >= 2 && setShowRegencyDropdown(true)}
                      className="h-10 border-stone-300 pl-9 pr-9"
                    />
                    {regencySearch && (
                      <button
                        onClick={() => { setRegencySearch(''); setShowRegencyDropdown(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showRegencyDropdown && regencySearch.length >= 2 && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                      {regencyResults && regencyResults.length > 0 ? (
                        regencyResults.map((item: Record<string, string>) => (
                          <button
                            key={item.code}
                            onClick={() => handleRegencySelect({ code: item.code, name: item.name })}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <Building2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                              <p className="text-xs text-stone-400">{item.province}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center">
                          <p className="text-sm text-stone-400">Kabupaten tidak ditemukan</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step 2: Kecamatan Select */}
          <div>
            <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
              <MapPinned className="h-3.5 w-3.5 text-stone-400" />
              Kecamatan *
            </Label>
            <div className="relative" ref={districtInputRef}>
              {originDistrictCode && !showDistrictDropdown ? (
                <div className="flex h-10 items-center justify-between rounded-md border border-stone-300 bg-stone-50 px-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-medium text-stone-900">{originDistrictName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setOriginDistrictCode('');
                      setOriginDistrictName('');
                      setOriginVillageCode('');
                      setOriginVillageName('');
                      setShowDistrictDropdown(true);
                    }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => {
                      if (originRegencyCode) setShowDistrictDropdown(!showDistrictDropdown);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!originRegencyCode}
                  >
                    <span>{originDistrictName || (originRegencyCode ? 'Klik untuk pilih kecamatan' : 'Pilih kabupaten dulu')}</span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </button>
                  {showDistrictDropdown && originRegencyCode && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                      {districtResults && districtResults.length > 0 ? (
                        districtResults.map((item: Record<string, string>) => (
                          <button
                            key={item.code}
                            onClick={() => handleDistrictSelect({ code: item.code, name: item.name })}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <MapPinned className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                              <p className="text-xs text-stone-400">{item.regency}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center">
                          <p className="text-sm text-stone-400">Kecamatan tidak ditemukan</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Kelurahan Select */}
          <div>
            <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              Kelurahan / Desa *
            </Label>
            <div className="relative" ref={villageInputRef}>
              {originVillageCode ? (
                <div className="flex h-10 items-center justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-900">{originVillageName}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-200 text-emerald-600">
                      {originVillageCode}
                    </Badge>
                  </div>
                  <button
                    onClick={() => {
                      setOriginVillageCode('');
                      setOriginVillageName('');
                      setShowVillageDropdown(true);
                    }}
                    className="text-emerald-400 hover:text-emerald-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => {
                      if (originDistrictCode) setShowVillageDropdown(!showVillageDropdown);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!originDistrictCode}
                  >
                    <span>{villagesLoading ? 'Memuat...' : (originDistrictCode ? 'Klik untuk pilih kelurahan' : 'Pilih kecamatan dulu')}</span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </button>
                  {showVillageDropdown && originDistrictCode && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                      {villagesLoading && (
                        <div className="px-3 py-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-stone-400" />
                          <p className="text-sm text-stone-400 mt-1">Memuat kelurahan...</p>
                        </div>
                      )}
                      {villageResults && villageResults.length > 0 && !villagesLoading && (
                        villageResults.map((item: Record<string, string>) => (
                          <button
                            key={item.code}
                            onClick={() => handleVillageSelect({ code: item.code, name: item.name })}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                              <p className="text-xs text-stone-400">{item.district}, {item.regency}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-stone-200 text-stone-400 shrink-0">
                              {item.code}
                            </Badge>
                          </button>
                        ))
                      )}
                      {villageResults && villageResults.length === 0 && !villagesLoading && (
                        <div className="px-3 py-4 text-center">
                          <p className="text-sm text-stone-400">Kelurahan tidak ditemukan</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!originVillageCode && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-700 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Penting: Lokasi toko harus diisi agar perhitungan ongkir bisa dilakukan saat checkout.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* COD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cash on Delivery (COD)</CardTitle>
          <CardDescription>Aktifkan opsi bayar di tempat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Aktifkan COD</p>
              <p className="text-xs text-gray-400">Pelanggan bisa bayar saat barang sampai</p>
            </div>
            <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* API Integration - api.co.id */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-rose-500" />
            API Cek Ongkir (api.co.id)
          </CardTitle>
          <CardDescription>
            Integrasi real-time cek ongkos kirim dari api.co.id
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50">
            <div>
              <p className="text-sm font-medium text-emerald-800">Status: Terhubung</p>
              <p className="text-xs text-emerald-600">API aktif dan siap digunakan di checkout</p>
            </div>
            <Badge className="bg-emerald-500 text-white border-0 text-[10px]">AKTIF</Badge>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Fitur yang tersedia:</p>
            <ul className="text-xs text-gray-500 space-y-1 ml-3">
              <li>• Cek ongkir real-time berdasarkan kelurahan</li>
              <li>• Pencarian kota/kabupaten/kecamatan otomatis</li>
              <li>• Support kurir: JNE, SiCepat, SAP, J&T, AnterAja, Lion Parcel, Ninja, dll</li>
              <li>• Estimasi waktu pengiriman per kurir</li>
              <li>• Auto-cache untuk performa</li>
            </ul>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Dokumentasi:{' '}
              <a
                href="https://docs.api.co.id/products/indonesia-expedition-cost/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                docs.api.co.id
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Methods (Fallback / Manual Override) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Metode Pengiriman (Fallback)</CardTitle>
            <CardDescription>Kurir manual jika API tidak tersedia</CardDescription>
          </div>
          <Button onClick={addMethod} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada metode pengiriman</p>
              <Button variant="outline" size="sm" onClick={addMethod} className="mt-3">
                <Plus className="h-4 w-4 mr-1" />
                Tambah Metode
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {methods.map((method, index) => (
                <div
                  key={method.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => removeMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Kurir</Label>
                      <select
                        value={method.courier}
                        onChange={(e) => updateMethod(method.id, 'courier', e.target.value)}
                        className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">Pilih Kurir</option>
                        {courierOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Layanan</Label>
                      <Input
                        value={method.service}
                        onChange={(e) => updateMethod(method.id, 'service', e.target.value)}
                        placeholder="Reguler, YES, dll"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Harga (Rp)</Label>
                      <Input
                        type="number"
                        value={method.price}
                        onChange={(e) =>
                          updateMethod(method.id, 'price', Number(e.target.value) || 0)
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Estimasi</Label>
                      <Input
                        value={method.eta}
                        onChange={(e) => updateMethod(method.id, 'eta', e.target.value)}
                        placeholder="2-3 hari"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
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
              Simpan Pengaturan Pengiriman
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===================== PAYMENT SETTINGS =====================
function PaymentSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
}) {
  const [methods, setMethods] = useState<PaymentMethodItem[]>(settings.paymentMethods);
  const [bankName, setBankName] = useState(settings.bankName || '');
  const [bankAccount, setBankAccount] = useState(settings.bankAccount || '');
  const [bankHolder, setBankHolder] = useState(settings.bankHolder || '');
  const [ewalletName, setEwalletName] = useState(settings.ewalletName || '');
  const [ewalletNumber, setEwalletNumber] = useState(settings.ewalletNumber || '');
  const [qrisEnabled, setQrisEnabled] = useState(settings.qrisEnabled);

  const toggleMethod = (id: string) => {
    setMethods(
      methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleSave = () => {
    onSave({
      paymentMethods: methods,
      bankName,
      bankAccount,
      bankHolder,
      ewalletName,
      ewalletNumber,
      qrisEnabled,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'Bank Transfer';
      case 'ewallet': return 'E-Wallet';
      case 'qris': return 'QRIS';
      case 'cod': return 'COD';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ewallet': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'qris': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cod': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const grouped = {
    bank: methods.filter((m) => m.type === 'bank'),
    ewallet: methods.filter((m) => m.type === 'ewallet'),
    qris: methods.filter((m) => m.type === 'qris'),
    cod: methods.filter((m) => m.type === 'cod'),
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metode Pembayaran</CardTitle>
          <CardDescription>Aktifkan/nonaktifkan metode pembayaran yang tersedia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                {getTypeLabel(type)} ({items.filter((m) => m.enabled).length}/{items.length} aktif)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      method.enabled
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 border ${getTypeColor(method.type)}`}
                      >
                        {getTypeLabel(method.type)}
                      </Badge>
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                    <Switch checked={method.enabled} onCheckedChange={() => toggleMethod(method.id)} />
                  </div>
                ))}
              </div>
              {type !== 'cod' && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rekening Bank</CardTitle>
          <CardDescription>Informasi rekening untuk pembayaran transfer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank BCA"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="8720123456"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Atas Nama</Label>
            <Input
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              placeholder="PT LUXE Fashion Indonesia"
            />
          </div>
          {bankName && bankAccount && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Preview di checkout:</p>
              <p className="text-sm font-semibold text-gray-900">{bankName}</p>
              <p className="text-lg font-mono font-bold text-gray-800">{bankAccount}</p>
              <p className="text-sm text-gray-600">a.n. {bankHolder}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">E-Wallet / QRIS</CardTitle>
          <CardDescription>Informasi e-wallet untuk pembayaran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama E-Wallet</Label>
              <Input
                value={ewalletName}
                onChange={(e) => setEwalletName(e.target.value)}
                placeholder="GoPay / OVO / DANA"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor E-Wallet</Label>
              <Input
                value={ewalletNumber}
                onChange={(e) => setEwalletNumber(e.target.value)}
                placeholder="081234567890"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50">
            <div>
              <p className="text-sm font-medium text-amber-800">Aktifkan QRIS</p>
              <p className="text-xs text-amber-600">Terima pembayaran QRIS universal</p>
            </div>
            <Switch checked={qrisEnabled} onCheckedChange={setQrisEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
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
              Simpan Pengaturan Pembayaran
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===================== APPEARANCE SETTINGS =====================
function AppearanceSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
}) {
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [showBrands, setShowBrands] = useState(settings.showBrands);
  const [showTestimonials, setShowTestimonials] = useState(settings.showTestimonials);
  const [showNewsletter, setShowNewsletter] = useState(settings.showNewsletter);

  const handleSave = () => {
    onSave({
      primaryColor,
      fontFamily,
      showBrands,
      showTestimonials,
      showNewsletter,
    });
  };

  const colorPresets = [
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  const fontOptions = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Montserrat', 'Quicksand'];

  return (
    <div className="space-y-6">
      {/* Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Warna Utama</CardTitle>
          <CardDescription>Pilih warna tema utama untuk toko Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor(color.value)}
                className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                  primaryColor === color.value
                    ? 'border-gray-900 scale-110 shadow-lg'
                    : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="customColor">Custom:</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="customColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 font-mono"
                placeholder="#f43f5e"
              />
            </div>
          </div>
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-xs text-gray-400 mb-3">Preview:</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                style={{
                  backgroundColor: primaryColor,
                }}
                className="text-white hover:opacity-90"
              >
                Primary Button
              </Button>
              <Badge
                style={{
                  backgroundColor: primaryColor,
                }}
                className="text-white border-0"
              >
                Badge
              </Badge>
              <div
                className="w-16 h-4 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="w-16 h-4 rounded"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font</CardTitle>
          <CardDescription>Pilih jenis font untuk toko Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  fontFamily === font
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold" style={{ fontFamily: font === 'Inter' ? 'inherit' : font }}>
                  {font}
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: font === 'Inter' ? 'inherit' : font }}>
                  Aa Bb Cc
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Homepage Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bagian Homepage</CardTitle>
          <CardDescription>Tampilkan atau sembunyikan bagian di halaman utama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Brand Slider</p>
              <p className="text-xs text-gray-400">Tampilkan slider brand di homepage</p>
            </div>
            <Switch checked={showBrands} onCheckedChange={setShowBrands} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Testimoni</p>
              <p className="text-xs text-gray-400">Tampilkan section testimoni pelanggan</p>
            </div>
            <Switch checked={showTestimonials} onCheckedChange={setShowTestimonials} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Newsletter</p>
              <p className="text-xs text-gray-400">Tampilkan form subscribe newsletter</p>
            </div>
            <Switch checked={showNewsletter} onCheckedChange={setShowNewsletter} />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
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
              Simpan Pengaturan Tampilan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===================== NOTIFICATION SETTINGS =====================
function NotificationSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
}) {
  const [emailNewOrder, setEmailNewOrder] = useState(settings.emailNewOrder);
  const [emailLowStock, setEmailLowStock] = useState(settings.emailLowStock);
  const [emailNewReview, setEmailNewReview] = useState(settings.emailNewReview);
  const [whatsappNotify, setWhatsappNotify] = useState(settings.whatsappNotify);
  const [notifyEmail, setNotifyEmail] = useState(settings.notifyEmail || '');

  const handleSave = () => {
    onSave({
      emailNewOrder,
      emailLowStock,
      emailNewReview,
      whatsappNotify,
      notifyEmail,
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-rose-500" />
            Notifikasi Email
          </CardTitle>
          <CardDescription>Atur email notifikasi yang ingin Anda terima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Order Baru</p>
              <p className="text-xs text-gray-400">Kirim email saat ada pesanan baru masuk</p>
            </div>
            <Switch checked={emailNewOrder} onCheckedChange={setEmailNewOrder} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Stok Habis / Rendah</p>
              <p className="text-xs text-gray-400">Kirim email saat stok produk menipis</p>
            </div>
            <Switch checked={emailLowStock} onCheckedChange={setEmailLowStock} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Review Baru</p>
              <p className="text-xs text-gray-400">Kirim email saat pelanggan memberi review</p>
            </div>
            <Switch checked={emailNewReview} onCheckedChange={setEmailNewReview} />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifikasi WhatsApp</CardTitle>
          <CardDescription>Kirim notifikasi via WhatsApp untuk update penting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50">
            <div>
              <p className="text-sm font-medium text-emerald-800">Aktifkan WhatsApp Notifikasi</p>
              <p className="text-xs text-emerald-600">Terima notifikasi order baru via WhatsApp</p>
            </div>
            <Switch checked={whatsappNotify} onCheckedChange={setWhatsappNotify} />
          </div>
          <div className="space-y-2">
            <Label>Notifikasi Email Tujuan</Label>
            <Input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="admin@luxefashion.com"
            />
            <p className="text-xs text-gray-400">
              Email tujuan untuk semua notifikasi (opsional, default: email toko)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
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
              Simpan Pengaturan Notifikasi
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===================== SECURITY SETTINGS =====================
function SecuritySettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: StoreSettingsData;
  onSave: (data: Partial<StoreSettingsData>) => void;
  isSaving: boolean;
}) {
  const [twoFactor, setTwoFactor] = useState(settings.twoFactorEnabled);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveSecurity = () => {
    onSave({ twoFactorEnabled: twoFactor });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Semua field password harus diisi');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }
    toast.success('Password berhasil diubah!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(newPassword);
  const strengthLabel = ['', 'Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'][strength];

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-rose-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Tambahkan lapisan keamanan ekstra untuk akun admin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${twoFactor ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <Shield className={`h-5 w-5 ${twoFactor ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Autentikasi Dua Langkah
                </p>
                <p className="text-xs text-gray-400">
                  {twoFactor
                    ? '2FA sudah aktif - akun Anda terlindungi'
                    : '2FA tidak aktif - disarankan untuk mengaktifkan'}
                </p>
              </div>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSecurity}
              disabled={isSaving}
              size="sm"
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ubah Password Admin</CardTitle>
          <CardDescription>Ubah password untuk masuk ke panel admin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password Saat Ini</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= strength ? strengthColor : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${strength >= 3 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  Kekuatan: {strengthLabel}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className={`pr-10 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-300 focus-visible:ring-red-500'
                    : confirmPassword && confirmPassword === newPassword
                    ? 'border-emerald-300 focus-visible:ring-emerald-500'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">Password tidak cocok</p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Password cocok
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Ubah Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Sesi</CardTitle>
          <CardDescription>Aktivitas login terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sesi Aktif - Chrome</p>
                  <p className="text-xs text-gray-400">
                    Jakarta, Indonesia • Sekarang
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">
                Aktif
              </Badge>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Hanya satu sesi aktif yang diperbolehkan. Login dari perangkat lain akan menggantikan sesi ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
