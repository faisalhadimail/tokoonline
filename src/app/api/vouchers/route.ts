import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Kode voucher diperlukan' });
    }

    const voucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ valid: false, message: 'Voucher tidak valid atau sudah tidak berlaku' });
    }

    const now = new Date();
    if (voucher.startDate && voucher.startDate > now) {
      return NextResponse.json({ valid: false, message: 'Voucher belum berlaku' });
    }
    if (voucher.endDate && voucher.endDate < now) {
      return NextResponse.json({ valid: false, message: 'Voucher sudah expired' });
    }
    if (voucher.quota && voucher.used >= voucher.quota) {
      return NextResponse.json({ valid: false, message: 'Kuota voucher sudah habis' });
    }

    return NextResponse.json({
      valid: true,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      discount: voucher.value, // Simplified
      minPurchase: voucher.minPurchase,
      maxDiscount: voucher.maxDiscount,
    });
  } catch (error) {
    console.error('Voucher API error:', error);
    return NextResponse.json({ valid: false, message: 'Internal server error' });
  }
}
