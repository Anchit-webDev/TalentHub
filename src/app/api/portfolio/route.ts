import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Missing creatorId parameter' }, { status: 400 });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { creatorProfileId: creatorId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json({ items: [], error: 'Database connection offline' });
  }
}
