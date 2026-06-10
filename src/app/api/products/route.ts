import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/helpers';

// GET /api/products — supports storefront + admin modes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new');
    const lowStock = searchParams.get('lowStock');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const ids = searchParams.get('ids');

    const where: Record<string, unknown> = {};

    // Admin mode: don't filter by isActive unless status says so
    if (admin !== 'true') {
      where.isActive = true;
    }

    // Status filter (admin)
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'featured') {
      where.isFeatured = true;
    } else if (status === 'preorder') {
      where.isPreorder = true;
    }

    if (featured === 'true') where.isFeatured = true;
    if (isNew === 'true') where.isNew = true;
    if (lowStock === 'true') {
      where.isActive = true;
    }
    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (minPrice) where.price = { ...(where.price as Record<string, unknown> || {}), gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...(where.price as Record<string, unknown> || {}), lte: parseFloat(maxPrice) };
    if (ids) {
      where.id = { in: ids.split(',') };
    }

    // orderBy supports both simple fields and relation count ordering
    let orderBy: Record<string, unknown> = {};
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'popular') orderBy = { createdAt: 'desc' };
    else if (sort === 'best-selling') orderBy = { orderItems: { _count: 'desc' } };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else orderBy = { createdAt: 'desc' };

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
    let serialized = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    }));

    // lowStock filter: in-memory filter for stock <= minStock (Prisma can't compare two fields)
    if (lowStock === 'true') {
      serialized = serialized.filter((p) => p.stock <= p.minStock);
    }

    return NextResponse.json({
      products: serialized,
      total: lowStock === 'true' ? serialized.length : total,
      pages: Math.ceil((lowStock === 'true' ? serialized.length : total) / limit),
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: [], total: 0, pages: 0 });
  }
}

// POST /api/products — create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      shortDesc,
      price,
      comparePrice,
      sku,
      weight,
      stock,
      minStock,
      images,
      categoryIds,
      isActive,
      isFeatured,
      isPreorder,
    } = body;

    if (!name || !sku || price === undefined) {
      return NextResponse.json(
        { error: 'Name, SKU, and price are required' },
        { status: 400 }
      );
    }

    // Parse images: if it's a string JSON array, parse it; if it's already an array, stringify for DB
    let imagesStr = '[]';
    if (typeof images === 'string') {
      try {
        JSON.parse(images); // validate it's valid JSON
        imagesStr = images;
      } catch {
        // treat as single URL
        imagesStr = JSON.stringify([images]);
      }
    } else if (Array.isArray(images)) {
      imagesStr = JSON.stringify(images);
    }

    const slug = slugify(name);

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || '',
        shortDesc: shortDesc || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku,
        weight: weight ? parseFloat(weight) : 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        images: imagesStr,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        isPreorder: isPreorder === true,
        isNew: true,
        categories: categoryIds?.length
          ? {
              create: categoryIds.map((catId: string) => ({
                category: { connect: { id: catId } },
              })),
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        variations: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    const serialized = {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
