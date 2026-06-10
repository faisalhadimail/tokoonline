import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/helpers';

// GET /api/products/[id] — single product detail
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

// PUT /api/products/[id] — update product (full update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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

    // Parse images
    let imagesStr = existing.images;
    if (images !== undefined) {
      if (typeof images === 'string') {
        try {
          JSON.parse(images);
          imagesStr = images;
        } catch {
          imagesStr = JSON.stringify([images]);
        }
      } else if (Array.isArray(images)) {
        imagesStr = JSON.stringify(images);
      }
    }

    // Update categories: delete existing, create new
    if (categoryIds !== undefined && Array.isArray(categoryIds)) {
      await db.categoryProduct.deleteMany({ where: { productId: id } });
      if (categoryIds.length > 0) {
        await db.categoryProduct.createMany({
          data: categoryIds.map((catId: string) => ({
            categoryId: catId,
            productId: id,
          })),
        });
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name, slug: slugify(name) }),
        ...(description !== undefined && { description }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && {
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        }),
        ...(sku !== undefined && { sku }),
        ...(weight !== undefined && { weight: parseFloat(weight) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(minStock !== undefined && { minStock: parseInt(minStock) }),
        images: imagesStr,
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPreorder !== undefined && { isPreorder }),
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

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] — partial update (e.g., stock update)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isNew !== undefined) updateData.isNew = body.isNew;
    if (body.isPreorder !== undefined) updateData.isPreorder = body.isPreorder;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Patch product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] — delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete related records first (cascade should handle this, but be explicit)
    await db.categoryProduct.deleteMany({ where: { productId: id } });
    await db.productVariation.deleteMany({ where: { productId: id } });
    await db.flashSaleItem.deleteMany({ where: { productId: id } });

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
