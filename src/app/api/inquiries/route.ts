import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'creator' | 'client'

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    let inquiries;
    if (role === 'creator') {
      inquiries = await prisma.inquiry.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
        },
      });
    } else {
      inquiries = await prisma.inquiry.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            include: {
              creatorProfile: true,
            },
          },
          reviews: true,
        },
      });
    }

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { creatorId, clientId, category, eventDate, message } = data;

    if (!creatorId || !clientId || !category || !message) {
      return NextResponse.json({ error: 'Missing required inquiry fields' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        creatorId,
        clientId,
        category,
        eventDate: eventDate ? new Date(eventDate) : null,
        message,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { inquiryId, status } = data; // status: 'accepted' | 'declined' | 'completed'

    if (!inquiryId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error: any) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
