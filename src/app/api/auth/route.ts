import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone } = body;

    if (action === 'login') {
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'Email tidak ditemukan' });
      }

      // Demo: accept any password
      if (!password) {
        return NextResponse.json({ success: false, message: 'Password harus diisi' });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          memberLevel: user.memberLevel,
          points: user.points,
          isActive: user.isActive,
        },
      });
    }

    if (action === 'register') {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Email sudah terdaftar' });
      }

      const user = await db.user.create({
        data: {
          email,
          name,
          phone,
          password, // Plain text for demo
          role: 'customer',
          memberLevel: 'silver',
          points: 0,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          memberLevel: user.memberLevel,
          points: user.points,
          isActive: user.isActive,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}
