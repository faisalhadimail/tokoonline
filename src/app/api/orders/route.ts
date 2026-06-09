import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateOrderNumber } from '@/lib/helpers';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      take: 50,
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderNumber = generateOrderNumber();

    // Resolve userId — use the authenticated user's ID or find/create a guest user
    let userId = body.userId || null;
    if (!userId) {
      // Try to find a guest customer account, or create one
      const guestEmail = body.shippingAddress?.phone
        ? `guest-${body.shippingAddress.phone}@luxe.local`
        : 'guest@luxe.local';

      let guestUser = await db.user.findUnique({
        where: { email: guestEmail },
      });

      if (!guestUser) {
        // Create a guest customer account
        guestUser = await db.user.create({
          data: {
            email: guestEmail,
            name: body.shippingAddress?.recipient || 'Guest Customer',
            phone: body.shippingAddress?.phone || null,
            role: 'customer',
          },
        });
      }
      userId = guestUser.id;
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'pending',
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        discount: body.discount || 0,
        total: body.total,
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentMethod === 'cod' ? 'pending' : 'pending',
        courier: body.courier,
        courierService: body.courierService,
        shippingAddress: JSON.stringify(body.shippingAddress),
        notes: body.shippingAddress?.notes || body.notes,
        voucherCode: body.voucherCode,
        items: {
          create: body.items.map((item: Record<string, unknown>) => ({
            // Only set productId if it looks like a valid DB ID (cuid format)
            productId: typeof item.productId === 'string' && item.productId.length >= 10 ? item.productId as string : null,
            productName: item.name as string,
            productImage: item.image as string || null,
            variation: item.variation as string || null,
            price: item.price as number,
            quantity: item.quantity as number,
            subtotal: (item.price as number) * (item.quantity as number),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update promo/voucher usage if applicable
    if (body.promoCode) {
      await db.promo.updateMany({
        where: { code: body.promoCode, isActive: true },
        data: { used: { increment: 1 } },
      });
    }
    if (body.voucherCode) {
      await db.voucher.updateMany({
        where: { code: body.voucherCode, isActive: true },
        data: { used: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}
