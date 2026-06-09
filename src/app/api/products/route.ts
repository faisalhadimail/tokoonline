import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const ids = searchParams.get('ids');

    const where: Record<string, unknown> = { isActive: true };

    if (featured === 'true') where.isFeatured = true;
    if (isNew === 'true') where.isNew = true;
    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice) where.price = { ...(where.price as Record<string, unknown> || {}), gte: parseInt(minPrice) };
    if (maxPrice) where.price = { ...(where.price as Record<string, unknown> || {}), lte: parseInt(maxPrice) };
    if (ids) {
      where.id = { in: ids.split(',') };
    }

    const orderBy: Record<string, string> = {};
    if (sort === 'price-asc') orderBy.price = 'asc';
    else if (sort === 'price-desc') orderBy.price = 'desc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';
    else if (sort === 'popular') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          categories: { include: { category: true } },
          variations: true,
          reviews: { include: { user: { select: { name: true, avatar: true } } } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    // Parse images from JSON string if needed
    const serialized = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    }));

    return NextResponse.json({
      products: serialized,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: [], total: 0, pages: 0 });
  }
}
