import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reviews - List reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter is required' },
        { status: 400 }
      )
    }

    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, rating, title, comment, images, isVerified } = body

    if (!userId || !productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'userId, productId, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const review = await db.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        comment,
        images: images ? JSON.stringify(images) : '[]',
        isVerified: isVerified || false,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
