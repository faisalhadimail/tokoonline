import { NextRequest, NextResponse } from 'next/server';

const API_CO_ID_KEY = process.env.API_CO_ID_KEY || 'UYfF9CE4eL4niNVcrQ4i74HKyxKUuHQXQF21kvoGMVCgpReyJZ';
const BASE_URL = 'https://use.api.co.id';

// In-memory cache for area search
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// GET /api/shipping/search-area?search=Jakarta+Selatan&province_code=31
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const provinceCode = searchParams.get('province_code') || '';
    const regencyCode = searchParams.get('regency_code') || '';
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '20';
    const type = searchParams.get('type') || 'cities'; // cities | districts | villages

    if (!search && !provinceCode && !regencyCode) {
      return NextResponse.json(
        { error: 'search atau province_code wajib diisi' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `area:${type}:${search}:${provinceCode}:${regencyCode}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    let results: unknown[] = [];

    if (type === 'cities') {
      results = await searchCities(search, provinceCode, page, size);
    } else if (type === 'districts') {
      results = await searchDistricts(search, regencyCode, page, size);
    }

    const responseData = {
      results,
      total: results.length,
      type,
      search,
    };

    // Save to cache
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Area search API error:', error);
    return NextResponse.json(
      { error: 'Gagal mencari area' },
      { status: 500 }
    );
  }
}

async function searchCities(search: string, provinceCode: string, page: string, size: string) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);
  if (search) params.set('search', search);
  if (provinceCode) params.set('province_code', provinceCode);

  const response = await fetch(`${BASE_URL}/regional/indonesia/regencies?${params}`, {
    headers: { 'x-api-co-id': API_CO_ID_KEY },
  });
  const result = await response.json();

  if (!result.is_success) return [];

  return (result.data || []).map((item: Record<string, string>) => ({
    code: item.code,
    name: item.name,
    province: item.province,
    provinceCode: item.province_code,
    type: 'city',
  }));
}

async function searchDistricts(search: string, regencyCode: string, page: string, size: string) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);
  if (search) params.set('search', search);
  if (regencyCode) params.set('regency_code', regencyCode);

  const response = await fetch(`${BASE_URL}/regional/indonesia/districts?${params}`, {
    headers: { 'x-api-co-id': API_CO_ID_KEY },
  });
  const result = await response.json();

  if (!result.is_success) return [];

  return (result.data || []).map((item: Record<string, string>) => ({
    code: item.code,
    name: item.name,
    regency: item.regency,
    regencyCode: item.regency_code,
    province: item.province,
    provinceCode: item.province_code,
    type: 'district',
  }));
}
