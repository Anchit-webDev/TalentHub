import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const creators = await prisma.user.findMany({
      where: { role: 'creator' },
      include: {
        creatorProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ creators });
  } catch (error: any) {
    console.error('Error fetching admin creator list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { userId, verified } = data;

    if (!userId || verified === undefined) {
      return NextResponse.json({ error: 'Missing parameters: userId, verified' }, { status: 400 });
    }

    const updatedProfile = await prisma.creatorProfile.update({
      where: { userId },
      data: { verified: Boolean(verified) },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Error toggling verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
