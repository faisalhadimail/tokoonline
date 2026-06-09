import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/promos/[id] — single promo
export async function GET(
  _request: Request,
  { params }: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const promo = await db.promo.findUnique({ where: { id } });

    if (!promo) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error('Promo GET by ID error:', error);
    return NextResponse.json({ error: 'Failed to fetch promo' }, { status: 500 });
  }
}

// PUT /api/promos/[id] — update promo
export async function PUT(
  request: Request,
  { params }: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.promo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const dup = await db.promo.findUnique({
        where: { code: body.code.toUpperCase() },
      });
      if (dup) {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined)
      updateData.description = body.description || null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.productIds !== undefined)
      updateData.productIds = body.productIds || '[]';
    if (body.minPurchase !== undefined)
      updateData.minPurchase = body.minPurchase ? Number(body.minPurchase) : null;
    if (body.maxDiscount !== undefined)
      updateData.maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : null;
    if (body.quota !== undefined)
      updateData.quota = body.quota ? Number(body.quota) : null;
    if (body.startDate !== undefined)
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined)
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.bannerText !== undefined)
      updateData.bannerText = body.bannerText || null;
    if (body.bannerSubtext !== undefined)
      updateData.bannerSubtext = body.bannerSubtext || null;
    if (body.bannerBg !== undefined) updateData.bannerBg = body.bannerBg;

    const promo = await db.promo.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error('Promo PUT error:', error);
    return NextResponse.json({ error: 'Failed to update promo' }, { status: 500 });
  }
}

// DELETE /api/promos/[id] — delete promo
export async function DELETE(
  _request: Request,
  { params }: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const existing = await db.promo.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    await db.promo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Promo DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete promo' }, { status: 500 });
  }
}
