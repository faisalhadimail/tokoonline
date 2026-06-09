'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Check,
  CreditCard,
  Truck,
  ClipboardCheck,
  MapPin,
  Phone,
  User,
  Search,
  X,
  Loader2,
  Zap,
  Info,
  Building2,
  MapPinned,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore, useCartStore, useAuthStore } from '@/stores';
import { formatRupiah } from '@/lib/helpers';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

const paymentMethods = [
  { id: 'qris', name: 'QRIS', type: 'qris' },
  { id: 'va-bca', name: 'VA BCA', type: 'va' },
  { id: 'va-mandiri', name: 'VA Mandiri', type: 'va' },
  { id: 'gopay', name: 'GoPay', type: 'ewallet' },
  { id: 'ovo', name: 'OVO', type: 'ewallet' },
  { id: 'cod', name: 'COD (Bayar di Tempat)', type: 'cod' },
];

// Fallback couriers when API fails
const fallbackCouriers = [
  { id: 'fb-jne-reg', code: 'JNE', name: 'JNE Express', price: 15000, estimation: '3-5 days', isApi: false },
  { id: 'fb-jne-yes', code: 'JNE', name: 'JNE YES', price: 25000, estimation: '1 day', isApi: false },
  { id: 'fb-jnt-ez', code: 'JT', name: 'J&T Express', price: 12000, estimation: '3-5 days', isApi: false },
  { id: 'fb-sicepat-reg', code: 'SiCepat', name: 'SiCepat Reguler', price: 13000, estimation: '2-4 days', isApi: false },
];

interface CourierOption {
  id: string;
  code: string;
  name: string;
  price: number;
  estimation: string | null;
  isApi?: boolean;
}

interface LocationSelection {
  regencyCode: string;
  regencyName: string;
  districtCode: string;
  districtName: string;
  villageCode: string;
  villageName: string;
  province: string;
}

export default function CheckoutPage() {
  const navigate = useNavigationStore();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const voucherDiscount = useCartStore((s) => s.voucherDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>(1);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('qris');
  const [orderNumber, setOrderNumber] = useState('');

  // Buyer location state
  const [buyerLocation, setBuyerLocation] = useState<LocationSelection | null>(null);
  const [regencySearch, setRegencySearch] = useState('');
  const [showRegencyDropdown, setShowRegencyDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);

  const regencyInputRef = useRef<HTMLDivElement>(null);
  const districtInputRef = useRef<HTMLDivElement>(null);
  const villageInputRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regencyInputRef.current && !regencyInputRef.current.contains(e.target as Node)) {
        setShowRegencyDropdown(false);
      }
      if (districtInputRef.current && !districtInputRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (villageInputRef.current && !villageInputRef.current.contains(e.target as Node)) {
        setShowVillageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Form state
  const [form, setForm] = useState({
    recipient: user?.name || '',
    phone: user?.phone || '',
    address: '',
    postalCode: '',
    notes: '',
  });

  // Fetch store settings (to get origin village code & free shipping min)
  const { data: storeSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const storeOriginCode = storeSettings?.originVillageCode || '';
  const freeShippingMin = 0; // removed, now using promo system for shipping discounts

  // Calculate total weight from cart items (in kg)
  const totalWeight = useMemo(() => {
    // Approximate: each item ~300g, convert to kg with minimum 1kg
    return Math.max(1, items.reduce((sum, item) => sum + item.quantity * 0.3, 0));
  }, [items]);

  // Search regencies
  const { data: regencyResults } = useQuery({
    queryKey: ['checkout-regencies', regencySearch],
    queryFn: () =>
      fetch(`/api/shipping/search-area?search=${encodeURIComponent(regencySearch)}&type=cities&size=15`)
        .then((r) => r.json())
        .then((d) => d.results || []),
    enabled: regencySearch.length >= 2 && showRegencyDropdown,
    staleTime: 60 * 60 * 1000,
  });

  // Search districts when regency is selected
  const { data: districtResults } = useQuery({
    queryKey: ['checkout-districts', buyerLocation?.regencyCode],
    queryFn: () =>
      fetch(`/api/shipping/search-area?type=districts&regency_code=${buyerLocation?.regencyCode}&size=100`)
        .then((r) => r.json())
        .then((d) => d.results || []),
    enabled: !!buyerLocation?.regencyCode && showDistrictDropdown,
    staleTime: 60 * 60 * 1000,
  });

  // Search villages when district is selected
  const { data: villageResults, isLoading: villagesLoading } = useQuery({
    queryKey: ['checkout-villages', buyerLocation?.districtCode],
    queryFn: () =>
      fetch(`/api/shipping/search-village?district_code=${buyerLocation?.districtCode}&size=100`)
        .then((r) => r.json())
        .then((d) => d.villages || []),
    enabled: !!buyerLocation?.districtCode && showVillageDropdown,
    staleTime: 60 * 60 * 1000,
  });

  // Fetch shipping costs when both origin and destination village codes are available
  const { data: shippingData, isLoading: shippingLoading, isError: shippingError } = useQuery({
    queryKey: ['shipping-cost', storeOriginCode, buyerLocation?.villageCode, totalWeight],
    queryFn: async () => {
      if (!storeOriginCode || !buyerLocation?.villageCode) throw new Error('Missing origin or destination');

      const resp = await fetch(
        `/api/shipping/cost?origin=${storeOriginCode}&destination=${buyerLocation.villageCode}&weight=${totalWeight}`
      );
      const data = await resp.json();

      if (data.error) throw new Error(data.error);
      if (!data.couriers?.length) throw new Error('Tidak ada kurir tersedia');

      return data.couriers;
    },
    enabled: !!storeOriginCode && !!buyerLocation?.villageCode && step === 1,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Get available couriers (API or fallback)
  const couriers: CourierOption[] = useMemo(() => {
    if (shippingError || !shippingData || shippingData.length === 0) {
      return fallbackCouriers;
    }
    return shippingData.map((c: Record<string, unknown>) => ({
      id: `api-${c.code}-${Math.random().toString(36).substring(2, 6)}`,
      code: c.code as string,
      name: c.name as string,
      price: c.price as number,
      estimation: c.estimation as string | null,
      isApi: true,
    }));
  }, [shippingData, shippingError]);

  // Auto-select first courier when options change
  const activeCourier = couriers.find((c) => c.id === selectedCourier) || couriers[0] || fallbackCouriers[0];

  // Apply free shipping threshold
  const baseShippingCost = activeCourier?.price || 0;
  const grandTotal = Math.max(0, getTotal() + baseShippingCost);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Location handlers
  const handleRegencySelect = (item: { code: string; name: string; province: string }) => {
    setBuyerLocation({
      regencyCode: item.code,
      regencyName: item.name,
      districtCode: '',
      districtName: '',
      villageCode: '',
      villageName: '',
      province: item.province,
    });
    setRegencySearch('');
    setShowRegencyDropdown(false);
    setShowDistrictDropdown(true);
    setSelectedCourier('');
  };

  const handleDistrictSelect = (item: { code: string; name: string }) => {
    if (!buyerLocation) return;
    setBuyerLocation({
      ...buyerLocation,
      districtCode: item.code,
      districtName: item.name,
      villageCode: '',
      villageName: '',
    });
    setShowDistrictDropdown(false);
    setShowVillageDropdown(true);
    setSelectedCourier('');
  };

  const handleVillageSelect = (item: { code: string; name: string }) => {
    if (!buyerLocation) return;
    setBuyerLocation({
      ...buyerLocation,
      villageCode: item.code,
      villageName: item.name,
    });
    setShowVillageDropdown(false);
  };

  const resetBuyerLocation = () => {
    setBuyerLocation(null);
    setSelectedCourier('');
  };

  const validateStep1 = () => {
    if (!form.recipient || !form.phone || !form.address || !buyerLocation?.villageCode || !form.postalCode) {
      toast.error('Lengkapi semua data pengiriman termasuk lokasi (kabupaten/kecamatan/kelurahan)');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      if (!selectedCourier) {
        setSelectedCourier(couriers[0]?.id || '');
      }
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (orderData: unknown) =>
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber || `ORD-${Date.now()}`);
      clearCart();
      navigate.navigate('order-success');
      window.scrollTo(0, 0);
    },
    onError: () => {
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    },
  });

  const handlePlaceOrder = () => {
    const orderData = {
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        variation: [item.color, item.size].filter(Boolean).join(' / '),
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        ...form,
        city: buyerLocation?.regencyName || '',
        province: buyerLocation?.province || '',
        district: buyerLocation?.districtName || '',
        village: buyerLocation?.villageName || '',
        regencyCode: buyerLocation?.regencyCode,
        districtCode: buyerLocation?.districtCode,
        villageCode: buyerLocation?.villageCode,
      },
      courier: activeCourier.name || activeCourier.code,
      courierCode: activeCourier.code,
      courierService: activeCourier.estimation || '',
      shippingCost: baseShippingCost,
      paymentMethod: selectedPayment,
      voucherCode,
      discount: voucherDiscount,
      subtotal: getSubtotal(),
      total: grandTotal,
    };

    orderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-stone-900">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-stone-500">Tambahkan produk ke keranjang sebelum checkout.</p>
        <Button
          className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => { navigate.navigate('shop'); window.scrollTo(0, 0); }}
        >
          Belanja Sekarang
        </Button>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Pengiriman', icon: Truck },
    { num: 2, label: 'Pembayaran', icon: CreditCard },
    { num: 3, label: 'Konfirmasi', icon: ClipboardCheck },
  ];

  const locationSteps = [
    { label: 'Kabupaten/Kota', icon: Building2, done: !!buyerLocation?.regencyCode },
    { label: 'Kecamatan', icon: MapPinned, done: !!buyerLocation?.districtCode },
    { label: 'Kelurahan', icon: MapPin, done: !!buyerLocation?.villageCode },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => { navigate.navigate('cart'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Keranjang
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Checkout</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900">Checkout</h1>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step > s.num
                  ? 'bg-emerald-500 text-white'
                  : step === s.num
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${
                step >= s.num ? 'text-stone-900' : 'text-stone-400'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-16 ${step > s.num ? 'bg-emerald-500' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <Card className="border-stone-200">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-600" />
                  Alamat Pengiriman
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 text-sm text-stone-700">Nama Penerima *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        placeholder="Nama lengkap"
                        value={form.recipient}
                        onChange={(e) => updateForm('recipient', e.target.value)}
                        className="h-10 border-stone-300 pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1.5 text-sm text-stone-700">No. Telepon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        placeholder="08xxxxxxxxxx"
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="h-10 border-stone-300 pl-9"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 text-sm text-stone-700">Alamat Lengkap *</Label>
                    <Textarea
                      placeholder="Jalan, No. Rumah, RT/RW"
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className="border-stone-300"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Location Selection: Kabupaten → Kecamatan → Kelurahan */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    {locationSteps.map((s, i) => {
                      const StepIcon = s.icon;
                      return (
                        <div key={s.label} className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            s.done
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-400 border border-stone-200'
                          }`}>
                            <StepIcon className="h-2.5 w-2.5" />
                            {s.label}
                            {s.done && <Check className="h-2.5 w-2.5" />}
                          </div>
                          {i < locationSteps.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-stone-300" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Current location display */}
                  {buyerLocation?.villageCode && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">
                            {buyerLocation.villageName}, {buyerLocation.districtName}
                          </p>
                          <p className="text-xs text-emerald-600">
                            {buyerLocation.regencyName}, {buyerLocation.province}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetBuyerLocation}
                        className="text-emerald-400 hover:text-emerald-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 1: Kabupaten/Kota */}
                  <div>
                    <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-stone-400" />
                      Kabupaten / Kota *
                    </Label>
                    <div className="relative" ref={regencyInputRef}>
                      {buyerLocation?.regencyCode && !showRegencyDropdown ? (
                        <div className="flex h-10 items-center justify-between rounded-md border border-stone-300 bg-stone-50 px-3">
                          <div className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-sm font-medium text-stone-900">{buyerLocation.regencyName}</span>
                            <span className="text-xs text-stone-400">{buyerLocation.province}</span>
                          </div>
                          <button
                            onClick={() => {
                              resetBuyerLocation();
                              setRegencySearch(buyerLocation.regencyName);
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
                              placeholder="Ketik nama kota/kabupaten... (min. 2 huruf)"
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
                                regencyResults.map((city: Record<string, string>) => (
                                  <button
                                    key={city.code}
                                    onClick={() => handleRegencySelect({ code: city.code, name: city.name, province: city.province })}
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                                  >
                                    <Building2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-stone-900 truncate">{city.name}</p>
                                      <p className="text-xs text-stone-400">{city.province}</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-center">
                                  <p className="text-sm text-stone-400">Kota tidak ditemukan</p>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Kecamatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
                        <MapPinned className="h-3.5 w-3.5 text-stone-400" />
                        Kecamatan *
                      </Label>
                      <div className="relative" ref={districtInputRef}>
                        {buyerLocation?.districtCode && !showDistrictDropdown ? (
                          <div className="flex h-10 items-center justify-between rounded-md border border-stone-300 bg-stone-50 px-3">
                            <div className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-sm font-medium text-stone-900">{buyerLocation.districtName}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (buyerLocation) {
                                  setBuyerLocation({
                                    ...buyerLocation,
                                    districtCode: '',
                                    districtName: '',
                                    villageCode: '',
                                    villageName: '',
                                  });
                                  setShowDistrictDropdown(true);
                                }
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
                                if (buyerLocation?.regencyCode) setShowDistrictDropdown(!showDistrictDropdown);
                              }}
                              className="flex h-10 w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!buyerLocation?.regencyCode}
                            >
                              <span className="truncate">{buyerLocation?.districtName || (buyerLocation?.regencyCode ? 'Klik untuk pilih kecamatan' : 'Pilih kabupaten dulu')}</span>
                              <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
                            </button>
                            {showDistrictDropdown && buyerLocation?.regencyCode && (
                              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                                {districtResults && districtResults.length > 0 ? (
                                  districtResults.map((dist: Record<string, string>) => (
                                    <button
                                      key={dist.code}
                                      onClick={() => handleDistrictSelect({ code: dist.code, name: dist.name })}
                                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                                    >
                                      <MapPinned className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-stone-900 truncate">{dist.name}</p>
                                        <p className="text-xs text-stone-400">{dist.regency}</p>
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

                    {/* Step 3: Kelurahan */}
                    <div>
                      <Label className="mb-1.5 text-sm text-stone-700 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        Kelurahan / Desa *
                      </Label>
                      <div className="relative" ref={villageInputRef}>
                        {buyerLocation?.villageCode ? (
                          <div className="flex h-10 items-center justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-sm font-medium text-emerald-900">{buyerLocation.villageName}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (buyerLocation) {
                                  setBuyerLocation({ ...buyerLocation, villageCode: '', villageName: '' });
                                  setShowVillageDropdown(true);
                                }
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
                                if (buyerLocation?.districtCode) setShowVillageDropdown(!showVillageDropdown);
                              }}
                              className="flex h-10 w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!buyerLocation?.districtCode}
                            >
                              <span className="truncate">{villagesLoading ? 'Memuat...' : (buyerLocation?.districtCode ? 'Klik untuk pilih kelurahan' : 'Pilih kecamatan dulu')}</span>
                              <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
                            </button>
                            {showVillageDropdown && buyerLocation?.districtCode && (
                              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                                {villagesLoading && (
                                  <div className="px-3 py-4 text-center">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-stone-400" />
                                    <p className="text-sm text-stone-400 mt-1">Memuat kelurahan...</p>
                                  </div>
                                )}
                                {villageResults && villageResults.length > 0 && !villagesLoading && (
                                  villageResults.map((v: Record<string, string>) => (
                                    <button
                                      key={v.code}
                                      onClick={() => handleVillageSelect({ code: v.code, name: v.name })}
                                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-stone-100 last:border-0"
                                    >
                                      <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                      <p className="text-sm font-medium text-stone-900 truncate">{v.name}</p>
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
                  </div>

                  <div>
                    <Label className="mb-1.5 text-sm text-stone-700">Kode Pos *</Label>
                    <Input
                      placeholder="Kode pos"
                      value={form.postalCode}
                      onChange={(e) => updateForm('postalCode', e.target.value)}
                      className="h-10 border-stone-300"
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5 text-sm text-stone-700">Catatan (Opsional)</Label>
                    <Textarea
                      placeholder="Catatan tambahan untuk kurir"
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      className="border-stone-300"
                      rows={2}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Courier Selection */}
                <h3 className="mb-2 text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-rose-600" />
                  Pilih Kurir
                </h3>
                <p className="mb-4 text-xs text-stone-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Harga ongkir real-time dari api.co.id • Total berat: {totalWeight.toFixed(1)} kg
                </p>

                {/* No store origin warning */}
                {!storeOriginCode && (
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      Admin belum mengatur lokasi toko. Harga ongkir menggunakan estimasi.
                    </p>
                  </div>
                )}

                {shippingLoading && buyerLocation?.villageCode && storeOriginCode && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                )}

                {!shippingLoading && (
                  <RadioGroup value={selectedCourier || couriers[0]?.id || ''} onValueChange={setSelectedCourier}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {couriers.map((c) => (
                        <label
                          key={c.id}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                            selectedCourier === c.id
                              ? 'border-rose-600 bg-rose-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={c.id} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-stone-900">{c.name}</p>
                                {c.isApi && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-200 text-emerald-600">
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              {c.estimation && (
                                <p className="text-xs text-stone-500">{c.estimation}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-stone-900">
                              {formatRupiah(c.price)}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* API Error Notice */}
                {shippingError && buyerLocation?.villageCode && storeOriginCode && (
                  <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3">
                    <p className="text-xs text-orange-700">
                      ⚠️ Gagal mengambil harga ongkir real-time. Menampilkan harga estimasi.
                    </p>
                  </div>
                )}

                {!buyerLocation?.villageCode && (
                  <div className="rounded-lg border-2 border-dashed border-stone-200 p-6 text-center">
                    <Truck className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">Pilih lokasi tujuan (kabupaten → kecamatan → kelurahan) untuk melihat opsi kurir & ongkir</p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="mt-6 w-full bg-rose-600 text-white hover:bg-rose-700"
                  onClick={handleNext}
                >
                  Lanjut ke Pembayaran
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card className="border-stone-200">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-600" />
                  Metode Pembayaran
                </h2>

                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                          selectedPayment === pm.id
                            ? 'border-rose-600 bg-rose-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <RadioGroupItem value={pm.id} />
                        <span className="text-sm font-medium text-stone-900">{pm.name}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-stone-300"
                    onClick={() => { setStep(1); window.scrollTo(0, 0); }}
                  >
                    Kembali
                  </Button>
                  <Button
                    className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => { setStep(3); window.scrollTo(0, 0); }}
                  >
                    Konfirmasi Pesanan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <Card className="border-stone-200">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-rose-600" />
                  Konfirmasi Pesanan
                </h2>

                {/* Shipping Summary */}
                <div className="rounded-lg bg-stone-50 p-4">
                  <h3 className="text-sm font-semibold text-stone-900 mb-2">Alamat Pengiriman</h3>
                  <p className="text-sm text-stone-600">{form.recipient} • {form.phone}</p>
                  <p className="text-sm text-stone-600">{form.address}</p>
                  <p className="text-sm text-stone-600">
                    {buyerLocation?.villageName}, {buyerLocation?.districtName}, {buyerLocation?.regencyName}, {buyerLocation?.province} {form.postalCode}
                  </p>
                  {form.notes && <p className="text-sm text-stone-500">Catatan: {form.notes}</p>}
                </div>

                <div className="mt-4 rounded-lg bg-stone-50 p-4">
                  <h3 className="text-sm font-semibold text-stone-900 mb-2">Kurir</h3>
                  <p className="text-sm text-stone-600">
                    {activeCourier.name} — {activeCourier.estimation || 'Estimasi tersedia'}
                  </p>
                  {activeCourier.isApi && (
                    <Badge variant="outline" className="mt-1 text-[9px] px-1.5 py-0 border-emerald-200 text-emerald-600">
                      Harga real-time api.co.id
                    </Badge>
                  )}
                </div>

                <div className="mt-4 rounded-lg bg-stone-50 p-4">
                  <h3 className="text-sm font-semibold text-stone-900 mb-2">Pembayaran</h3>
                  <p className="text-sm text-stone-600">
                    {paymentMethods.find((p) => p.id === selectedPayment)?.name}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-stone-900">Pesanan</h3>
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}-${item.size}`} className="flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg">
                        🛍️
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                        <p className="text-xs text-stone-500">
                          {item.quantity}x • {formatRupiah(item.price)}
                          {[item.color, item.size].filter(Boolean).length > 0 && ` • ${[item.color, item.size].filter(Boolean).join(' / ')}`}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-stone-900">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-stone-300"
                    onClick={() => { setStep(2); window.scrollTo(0, 0); }}
                  >
                    Kembali
                  </Button>
                  <Button
                    className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
                    onClick={handlePlaceOrder}
                    disabled={orderMutation.isPending}
                  >
                    {orderMutation.isPending ? 'Memproses...' : 'Bayar Sekarang'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24 border-stone-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-stone-900">Ringkasan</h3>

              <div className="mt-4 space-y-2">
                {items.slice(0, 3).map((item) => (
                  <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-stone-500 truncate max-w-[180px]">{item.name} (x{item.quantity})</span>
                    <span className="font-medium text-stone-900">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-stone-400">+{items.length - 3} produk lainnya</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium text-stone-900">{formatRupiah(getSubtotal())}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Diskon</span>
                    <span className="font-medium text-emerald-600">-{formatRupiah(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkir ({activeCourier?.name || 'Pilih kurir'})</span>
                  <span className="font-medium text-stone-900">
                    {baseShippingCost === 0 ? <span className="text-emerald-600">Gratis</span> : formatRupiah(baseShippingCost)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-bold text-stone-900">Total</span>
                  <span className="text-lg font-bold text-rose-600">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {storeOriginCode && activeCourier?.isApi && (
                <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-2 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  <p className="text-[10px] text-emerald-700">Ongkir real-time via api.co.id</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
