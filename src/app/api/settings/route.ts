import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Get store settings (singleton)
export async function GET() {
  try {
    let settings = await db.storeSettings.findFirst();

    // Auto-create default settings if none exist
    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          storeName: 'LUXE Fashion',
          storeTagline: 'Tampil Stylish Setiap Hari',
          storeEmail: 'hello@luxefashion.com',
          storePhone: '+62 812 3456 7890',
          whatsapp: '+62 812 3456 7890',
          storeAddress: 'Jl. Fashion Boulevard No. 88',
          storeCity: 'Jakarta Selatan',
          storeProvince: 'DKI Jakarta',
          storePostalCode: '12345',
          instagram: 'https://instagram.com/luxefashion',
          facebook: 'https://facebook.com/luxefashion',
          tiktok: 'https://tiktok.com/@luxefashion',
          metaTitle: 'LUXE Fashion - Toko Fashion Online Terlengkap',
          metaDesc: 'Belanja fashion terlengkap dengan harga terbaik. COD, pengiriman cepat, dan banyak promo menarik.',
          metaKeywords: 'fashion, baju, pakaian, online shop, jakarta',
          shippingMethods: JSON.stringify([
            { id: 'jne-reg', courier: 'JNE', service: 'Reguler', price: 18000, eta: '2-3 hari' },
            { id: 'jne-yes', courier: 'JNE', service: 'YES', price: 32000, eta: '1 hari' },
            { id: 'jnt-ez', courier: 'J&T', service: 'EZ', price: 15000, eta: '2-4 hari' },
            { id: 'sicepat-reg', courier: 'SiCepat', service: 'Reguler', price: 13000, eta: '2-3 hari' },
            { id: 'anteraja-ja', courier: 'AnterAja', service: 'JA', price: 12000, eta: '2-3 hari' },
          ]),
          paymentMethods: JSON.stringify([
            { id: 'bca', name: 'Bank BCA', type: 'bank', enabled: true },
            { id: 'bri', name: 'Bank BRI', type: 'bank', enabled: true },
            { id: 'mandiri', name: 'Bank Mandiri', type: 'bank', enabled: true },
            { id: 'bni', name: 'Bank BNI', type: 'bank', enabled: false },
            { id: 'gopay', name: 'GoPay', type: 'ewallet', enabled: true },
            { id: 'ovo', name: 'OVO', type: 'ewallet', enabled: true },
            { id: 'dana', name: 'DANA', type: 'ewallet', enabled: true },
            { id: 'shopeepay', name: 'ShopeePay', type: 'ewallet', enabled: true },
            { id: 'qris', name: 'QRIS', type: 'qris', enabled: true },
            { id: 'cod', name: 'Bayar di Tempat (COD)', type: 'cod', enabled: true },
          ]),
          bankName: 'Bank BCA',
          bankAccount: '8720123456',
          bankHolder: 'PT LUXE Fashion Indonesia',
          ewalletName: 'GoPay',
          ewalletNumber: '081234567890',
        },
      });
    }

    // Parse JSON fields
    const parsed = {
      ...settings,
      shippingMethods: JSON.parse(settings.shippingMethods || '[]'),
      paymentMethods: JSON.parse(settings.paymentMethods || '[]'),
      heroSlides: JSON.parse((settings as Record<string, unknown>).heroSlides as string || '[]'),
      homepageSections: JSON.parse((settings as Record<string, unknown>).homepageSections as string || '[]'),
      testimonialsData: JSON.parse((settings as Record<string, unknown>).testimonialsData as string || '[]'),
      brandPartners: JSON.parse((settings as Record<string, unknown>).brandPartners as string || '[]'),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update store settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    let settings = await db.storeSettings.findFirst();

    if (!settings) {
      settings = await db.storeSettings.create({ data: body });
    } else {
      const { shippingMethods, paymentMethods, heroSlides, homepageSections, testimonialsData, brandPartners, ...rest } = body;
      const updateData: Record<string, unknown> = { ...rest };

      // Stringify JSON fields if they are arrays
      if (shippingMethods !== undefined) {
        updateData.shippingMethods = JSON.stringify(shippingMethods);
      }
      if (paymentMethods !== undefined) {
        updateData.paymentMethods = JSON.stringify(paymentMethods);
      }
      if (heroSlides !== undefined) {
        updateData.heroSlides = JSON.stringify(heroSlides);
      }
      if (homepageSections !== undefined) {
        updateData.homepageSections = JSON.stringify(homepageSections);
      }
      if (testimonialsData !== undefined) {
        updateData.testimonialsData = JSON.stringify(testimonialsData);
      }
      if (brandPartners !== undefined) {
        updateData.brandPartners = JSON.stringify(brandPartners);
      }

      settings = await db.storeSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    const parsed = {
      ...settings,
      shippingMethods: JSON.parse(settings.shippingMethods || '[]'),
      paymentMethods: JSON.parse(settings.paymentMethods || '[]'),
      heroSlides: JSON.parse((settings as Record<string, unknown>).heroSlides as string || '[]'),
      homepageSections: JSON.parse((settings as Record<string, unknown>).homepageSections as string || '[]'),
      testimonialsData: JSON.parse((settings as Record<string, unknown>).testimonialsData as string || '[]'),
      brandPartners: JSON.parse((settings as Record<string, unknown>).brandPartners as string || '[]'),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
