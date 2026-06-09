import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total revenue
    const revenueResult = await db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'cancelled' } },
    });

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResult = await db.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: 'cancelled' },
        createdAt: { gte: today },
      },
    });

    // Total orders
    const totalOrders = await db.order.count();

    // Pending orders
    const pendingOrders = await db.order.count({
      where: { status: 'pending' },
    });

    // Total products
    const totalProducts = await db.product.count();

    // Total customers
    const totalCustomers = await db.user.count({
      where: { role: 'customer' },
    });

    // Analytics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const analytics = await db.analytics.findMany({
      where: { date: { gte: sevenDaysAgo.toISOString().split('T')[0] } },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      totalRevenue: revenueResult._sum.total || 0,
      todayRevenue: todayResult._sum.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      analytics: analytics.map((a) => ({
        date: a.date,
        visitors: a.visitors,
        orders: a.orders,
        revenue: a.revenue,
        pageViews: a.pageViews,
      })),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
