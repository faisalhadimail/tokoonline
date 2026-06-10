import { NextRequest, NextResponse } from 'next/server';

const API_CO_ID_KEY = process.env.API_CO_ID_KEY || 'UYfF9CE4eL4niNVcrQ4i74HKyxKUuHQXQF21kvoGMVCgpReyJZ';
const BASE_URL = 'https://use.api.co.id';

// In-memory cache for shipping cost results
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ShippingCostResult {
  courier_code: string;
  courier_name: string;
  price: number;
  weight: number;
  estimation: string | null;
}

// GET /api/shipping/cost?origin=ORIGIN_VILLAGE_CODE&destination=DEST_VILLAGE_CODE&weight=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const weight = searchParams.get('weight') || '1';

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'origin dan destination (village code) wajib diisi' },
        { status: 400 }
      );
    }

    const weightNum = Math.max(0.1, parseFloat(weight) || 1);

    // Check cache
    const cacheKey = `${origin}:${destination}:${weightNum}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Call api.co.id expedition cost API
    const apiUrl = new URL(`${BASE_URL}/expedition/shipping-cost`);
    apiUrl.searchParams.set('origin_village_code', origin);
    apiUrl.searchParams.set('destination_village_code', destination);
    apiUrl.searchParams.set('weight', weightNum.toString());

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'x-api-co-id': API_CO_ID_KEY,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.is_success) {
      return NextResponse.json(
        { error: result.message || 'Gagal mengambil data ongkos kirim' },
        { status: 400 }
      );
    }

    // Format the couriers
    const couriers = (result.data?.couriers || [])
      .map((c: ShippingCostResult) => ({
        code: c.courier_code,
        name: c.courier_name,
        price: c.price,
        weight: c.weight,
        estimation: c.estimation,
        isCargo: c.courier_code.toLowerCase().includes('cargo'),
      }))
      // Filter out zero-price couriers and cargo by default
      .filter((c: ShippingCostResult & { isCargo: boolean }) => c.price > 0 && !c.isCargo);

    // Sort by price ascending
    couriers.sort((a: ShippingCostResult, b: ShippingCostResult) => a.price - b.price);

    const responseData = {
      origin,
      destination,
      weight: weightNum,
      couriers,
      totalOptions: couriers.length,
    };

    // Save to cache
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Shipping cost API error:', error);
    return NextResponse.json(
      { error: 'Gagal menghitung ongkos kirim' },
      { status: 500 }
    );
  }
}
