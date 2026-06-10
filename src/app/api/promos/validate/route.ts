import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/promos/validate
// Query params:
//   code         - promo code to validate
//   subtotal     - cart subtotal (for percentage/fixed calculation)
//   shippingCost - current shipping cost (for shipping type)
//   productIds   - JSON array string of product IDs in cart (comma-separated or JSON array)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const subtotal = parseFloat(searchParams.get('subtotal') || '0')
    const shippingCost = parseFloat(searchParams.get('shippingCost') || '0')
    const productIdsParam = searchParams.get('productIds')

    // Validate required params
    if (!code) {
      return NextResponse.json({
        valid: false,
        promo: null,
        discount: 0,
        shippingDiscount: 0,
        message: 'Promo code is required',
      })
    }

    // Find promo by code
    const promo = await db.promo.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo) {
      return NextResponse.json({
        valid: false,
        promo: null,
        discount: 0,
        shippingDiscount: 0,
        message: 'Promo code not found',
      })
    }

    // Check if promo is active
    if (!promo.isActive) {
      return NextResponse.json({
        valid: false,
        promo,
        discount: 0,
        shippingDiscount: 0,
        message: 'This promo is no longer active',
      })
    }

    // Check date range
    const now = new Date()
    if (promo.startDate && promo.startDate > now) {
      return NextResponse.json({
        valid: false,
        promo,
        discount: 0,
        shippingDiscount: 0,
        message: 'This promo has not started yet',
      })
    }
    if (promo.endDate && promo.endDate < now) {
      return NextResponse.json({
        valid: false,
        promo,
        discount: 0,
        shippingDiscount: 0,
        message: 'This promo has expired',
      })
    }

    // Check quota
    if (promo.quota && promo.used >= promo.quota) {
      return NextResponse.json({
        valid: false,
        promo,
        discount: 0,
        shippingDiscount: 0,
        message: 'This promo has reached its usage limit',
      })
    }

    // Parse cart product IDs
    let cartProductIds: string[] = []
    if (productIdsParam) {
      try {
        // Try JSON parse first (e.g., '["id1","id2"]')
        const parsed = JSON.parse(productIdsParam)
        if (Array.isArray(parsed)) {
          cartProductIds = parsed
        }
      } catch {
        // Fallback: comma-separated (e.g., "id1,id2,id3")
        cartProductIds = productIdsParam
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      }
    }

    // For per_item scope: check if any matching products exist in cart
    if (promo.scope === 'per_item') {
      let promoProductIds: string[] = []
      try {
        promoProductIds = JSON.parse(promo.productIds)
      } catch {
        promoProductIds = []
      }

      const hasMatchingProducts = cartProductIds.some((cartId) =>
        promoProductIds.includes(cartId)
      )

      if (!hasMatchingProducts) {
        return NextResponse.json({
          valid: false,
          promo,
          discount: 0,
          shippingDiscount: 0,
          message: 'This promo does not apply to any items in your cart',
        })
      }
    }

    // Check minimum purchase
    if (promo.minPurchase && subtotal < promo.minPurchase) {
      return NextResponse.json({
        valid: false,
        promo,
        discount: 0,
        shippingDiscount: 0,
        message: `Minimum purchase of ${promo.minPurchase} required to use this promo`,
      })
    }

    // Calculate discount based on promo type
    let discount = 0
    let shippingDiscount = 0

    switch (promo.type) {
      case 'percentage': {
        const rawDiscount = (subtotal * promo.value) / 100
        discount = promo.maxDiscount
          ? Math.min(rawDiscount, promo.maxDiscount)
          : rawDiscount
        break
      }
      case 'fixed': {
        discount = promo.value
        break
      }
      case 'shipping': {
        shippingDiscount = Math.min(promo.value, shippingCost)
        break
      }
      default: {
        return NextResponse.json({
          valid: false,
          promo,
          discount: 0,
          shippingDiscount: 0,
          message: 'Unknown promo type',
        })
      }
    }

    return NextResponse.json({
      valid: true,
      promo,
      discount: Math.round(discount * 100) / 100,
      shippingDiscount: Math.round(shippingDiscount * 100) / 100,
      message: 'Promo applied successfully',
    })
  } catch (error) {
    console.error('Error validating promo:', error)
    return NextResponse.json(
      {
        valid: false,
        promo: null,
        discount: 0,
        shippingDiscount: 0,
        message: 'Failed to validate promo code',
      },
      { status: 500 }
    )
  }
}
