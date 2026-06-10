import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Search by order number
    if (search) {
      where.orderNumber = { contains: search, mode: 'insensitive' };
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    const total = await db.order.count({ where });

    return NextResponse.json(admin === 'true' ? { orders, total } : orders);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(admin === 'true' ? { orders: [], total: 0 } : []);
  }
}
