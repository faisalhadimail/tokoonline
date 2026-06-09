import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateOrderNumber } from '@/lib/helpers';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
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

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: 'customer-demo',
        status: 'pending',
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        discount: body.discount || 0,
        total: body.total,
        paymentMethod: body.paymentMethod,
        paymentStatus: 'pending',
        courier: body.courier,
        courierService: body.courierService,
        shippingAddress: JSON.stringify(body.shippingAddress),
        notes: body.shippingAddress?.notes,
        voucherCode: body.voucherCode,
        items: {
          create: body.items.map((item: Record<string, unknown>) => ({
            productId: item.productId as string,
            productName: item.name as string,
            productImage: item.image as string,
            variation: item.variation as string,
            price: item.price as number,
            quantity: item.quantity as number,
            subtotal: (item.price as number) * (item.quantity as number),
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' });
  }
}
