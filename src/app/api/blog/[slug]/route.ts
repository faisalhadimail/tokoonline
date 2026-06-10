import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await db.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog detail API error:', error);
    return NextResponse.json(null, { status: 500 });
  }
}
