import { NextRequest, NextResponse } from 'next/server';

const API_CO_ID_KEY = process.env.API_CO_ID_KEY || 'UYfF9CE4eL4niNVcrQ4i74HKyxKUuHQXQF21kvoGMVCgpReyJZ';
const BASE_URL = 'https://use.api.co.id';

// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// GET /api/shipping/search-village?district_code=317305&page=1&size=50
// GET /api/shipping/search-village?search=kebon&province_code=31
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get('district_code') || '';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '100';

    if (!districtCode && !search) {
      return NextResponse.json(
        { error: 'district_code atau search wajib diisi' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `village:${districtCode}:${search}:${page}:${size}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const params = new URLSearchParams();
    params.set('page', page);
    params.set('size', size);
    if (districtCode) params.set('district_code', districtCode);
    if (search) params.set('search', search);

    const response = await fetch(`${BASE_URL}/regional/indonesia/villages?${params}`, {
      headers: { 'x-api-co-id': API_CO_ID_KEY },
    });
    const result = await response.json();

    if (!result.is_success) {
      return NextResponse.json(
        { error: result.message || 'Gagal mencari kelurahan' },
        { status: 400 }
      );
    }

    const villages = (result.data || [])
      .filter((v: Record<string, unknown>) => v.is_courier_support)
      .map((v: Record<string, string>) => ({
        code: v.code,
        name: v.name,
        district: v.district,
        districtCode: v.district_code,
        regency: v.regency,
        regencyCode: v.regency_code,
        province: v.province,
        provinceCode: v.province_code,
        type: 'village',
      }));

    // If searching, also try districts fallback for broader results
    let districts: unknown[] = [];
    if (search && !districtCode && villages.length === 0) {
      districts = await searchDistrictsFallback(search);
    }

    const responseData = {
      villages,
      districts: districts.length > 0 ? districts : undefined,
      total: villages.length,
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Village search API error:', error);
    return NextResponse.json(
      { error: 'Gagal mencari kelurahan' },
      { status: 500 }
    );
  }
}

async function searchDistrictsFallback(search: string) {
  const params = new URLSearchParams();
  params.set('search', search);
  params.set('size', '50');

  const response = await fetch(`${BASE_URL}/regional/indonesia/districts?${params}`, {
    headers: { 'x-api-co-id': API_CO_ID_KEY },
  });
  const result = await response.json();

  if (!result.is_success) return [];

  return (result.data || []).map((d: Record<string, string>) => ({
    code: d.code,
    name: d.name,
    regency: d.regency,
    regencyCode: d.regency_code,
    province: d.province,
    provinceCode: d.province_code,
    type: 'district',
  }));
}
