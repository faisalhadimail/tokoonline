import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const flashSale = await db.flashSale.findFirst({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!flashSale) {
      return NextResponse.json({ items: [], endDate: new Date().toISOString() });
    }

    const serializedItems = flashSale.items.map((item) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        images: typeof item.product.images === 'string'
          ? JSON.parse(item.product.images)
          : (item.product.images || []),
      } : null,
    }));

    return NextResponse.json({
      items: serializedItems,
      endDate: flashSale.endDate.toISOString(),
    });
  } catch (error) {
    console.error('Flash Sale API error:', error);
    return NextResponse.json({ items: [], endDate: new Date().toISOString() });
  }
}
