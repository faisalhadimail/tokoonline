import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai - AI-powered features
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate-description':
        return handleGenerateDescription(body)
      case 'chat':
        return handleChat(body)
      case 'recommend':
        return handleRecommend(body)
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'AI service error' },
      { status: 500 }
    )
  }
}

// Generate product description from name
async function handleGenerateDescription(body: { productName: string; category?: string }) {
  const { productName, category } = body

  if (!productName) {
    return NextResponse.json(
      { error: 'productName is required' },
      { status: 400 }
    )
  }

  try {
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: `You are a fashion e-commerce copywriter for LUXE Fashion, an Indonesian online store. 
Generate a compelling product description in Indonesian (Bahasa Indonesia) for the given product.
The description should be engaging, highlight product features, and appeal to fashion-conscious customers.
Keep it between 100-200 words. Format with proper paragraphs.`,
        },
        {
          role: 'user',
          content: `Generate a product description for: "${productName}"${category ? ` in category "${category}"` : ''}. 
Include a short description (1 sentence) and a full description (2-3 paragraphs). Return as JSON with keys: "shortDesc" and "description".`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices?.[0]?.message?.content || ''

    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({ description: parsed })
      }
    } catch {
      // If JSON parsing fails, use raw content
    }

    return NextResponse.json({
      description: {
        shortDesc: content.substring(0, 100),
        description: content,
      },
    })
  } catch (error) {
    console.error('AI description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}

// AI customer service chatbot
async function handleChat(body: { message: string; userId?: string }) {
  const { message, userId } = body

  if (!message) {
    return NextResponse.json(
      { error: 'message is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch some context about the store
    const [productCount, categories] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.category.findMany({ take: 10, orderBy: { name: 'asc' } }),
    ])

    const categoryList = categories.map((c) => c.name).join(', ')

    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: `You are LUXE Fashion's AI customer service assistant. You help customers with:
- Product inquiries and recommendations
- Order tracking and status
- Size guide and fitting advice
- Shipping information (we ship across Indonesia via JNE, J&T, SiCepat)
- Return and exchange policy (7-day return window)
- Voucher and promo code questions
- Store hours and contact info

Store info: We have ${productCount} active products across categories: ${categoryList}.
Prices are in Indonesian Rupiah (Rp).
Always be polite, helpful, and respond in Bahasa Indonesia unless the customer writes in English.
Keep responses concise (2-3 sentences max unless explaining something complex).`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const reply = response.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

// Product recommendations
async function handleRecommend(body: { productId?: string; userId?: string; category?: string }) {
  const { productId, userId, category } = body

  try {
    let recommendations

    if (productId) {
      // Find similar products based on categories
      const product = await db.product.findUnique({
        where: { id: productId },
        include: {
          categories: {
            include: { category: true },
          },
        },
      })

      if (product) {
        const categorySlugs = product.categories.map((cp) => cp.category.slug)

        recommendations = await db.product.findMany({
          where: {
            isActive: true,
            id: { not: productId },
            categories: {
              some: {
                category: {
                  slug: { in: categorySlugs },
                },
              },
            },
          },
          take: 8,
          include: {
            categories: { include: { category: true } },
            _count: {
              select: { reviews: true, orderItems: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        // If not enough from same category, fill with featured/new products
        if (recommendations.length < 8) {
          const remaining = await db.product.findMany({
            where: {
              isActive: true,
              id: {
                notIn: [
                  productId,
                  ...recommendations.map((r) => r.id),
                ],
              },
            },
            take: 8 - recommendations.length,
            include: {
              categories: { include: { category: true } },
              _count: {
                select: { reviews: true, orderItems: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          })

          recommendations = [...recommendations, ...remaining]
        }
      }
    } else if (category) {
      recommendations = await db.product.findMany({
        where: {
          isActive: true,
          categories: {
            some: {
              category: { slug: category },
            },
          },
        },
        take: 8,
        include: {
          categories: { include: { category: true } },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
        orderBy: { isFeatured: 'desc' },
      })
    } else if (userId) {
      // Get user's order history for personalized recommendations
      const orderItems = await db.orderItem.findMany({
        where: {
          order: { userId },
        },
        select: { productId: true },
        distinct: ['productId'],
      })

      const purchasedProductIds = orderItems.map((oi) => oi.productId)

      // Find products in same categories as purchased items
      const purchasedProducts = await db.product.findMany({
        where: { id: { in: purchasedProductIds } },
        include: { categories: { include: { category: true } } },
      })

      const categorySlugs = purchasedProducts.flatMap((p) =>
        p.categories.map((cp) => cp.category.slug)
      )

      const uniqueSlugs = [...new Set(categorySlugs)]

      recommendations = await db.product.findMany({
        where: {
          isActive: true,
          id: { notIn: purchasedProductIds },
          categories: {
            some: {
              category: {
                slug: { in: uniqueSlugs },
              },
            },
          },
        },
        take: 8,
        include: {
          categories: { include: { category: true } },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
        orderBy: { isFeatured: 'desc' },
      })
    } else {
      // Default: featured and new products
      recommendations = await db.product.findMany({
        where: {
          isActive: true,
        },
        take: 8,
        include: {
          categories: { include: { category: true } },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    }

    return NextResponse.json({
      recommendations: recommendations || [],
    })
  } catch (error) {
    console.error('AI recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
