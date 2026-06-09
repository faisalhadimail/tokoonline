import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        variations: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json(null, { status: 404 });
    }

    const serialized = {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
      reviews: product.reviews.map((r: Record<string, unknown>) => ({
        ...r,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Product detail API error:', error);
    return NextResponse.json(null, { status: 500 });
  }
}
