import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/promos — list all promos
export async function GET() {
  try {
    const promos = await db.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error('Promos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promos' }, { status: 500 });
  }
}

// POST /api/promos — create promo
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      code,
      description,
      type,
      value,
      scope,
      productIds,
      minPurchase,
      maxDiscount,
      quota,
      startDate,
      endDate,
      isActive,
      bannerText,
      bannerSubtext,
      bannerBg,
    } = body;

    if (!name || !code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Name, code, type, and value are required' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await db.promo.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      );
    }

    const promo = await db.promo.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        type,
        value: Number(value),
        scope: scope || 'global',
        productIds: productIds || '[]',
        minPurchase: minPurchase ? Number(minPurchase) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        quota: quota ? Number(quota) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== false,
        bannerText: bannerText || null,
        bannerSubtext: bannerSubtext || null,
        bannerBg: bannerBg || 'from-rose-600 to-rose-500',
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error('Promos POST error:', error);
    return NextResponse.json({ error: 'Failed to create promo' }, { status: 500 });
  }
}
