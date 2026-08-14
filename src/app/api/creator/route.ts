import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId'); // Optional: check eligibility to write review

    if (!id) {
      return NextResponse.json({ error: 'Missing creator ID' }, { status: 400 });
    }

    const creator = await prisma.user.findFirst({
      where: { id, role: 'creator' },
      include: {
        creatorProfile: {
          include: {
            portfolioItems: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!creator || !creator.creatorProfile) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Load reviews
    const reviews = await prisma.review.findMany({
      where: {
        inquiry: {
          creatorId: id,
        },
      },
      include: {
        inquiry: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if client is eligible to leave a review:
    // Has a completed inquiry with this creator that has NO review yet
    let reviewEligibility = false;
    let eligibleInquiryId = '';

    if (clientId) {
      const completedInquiryWithoutReview = await prisma.inquiry.findFirst({
        where: {
          creatorId: id,
          clientId: clientId,
          status: 'completed',
          reviews: {
            none: {}, // No reviews exist for this inquiry
          },
        },
      });

      if (completedInquiryWithoutReview) {
        reviewEligibility = true;
        eligibleInquiryId = completedInquiryWithoutReview.id;
      }
    }

    return NextResponse.json({
      creator: {
        id: creator.id,
        name: creator.name,
        city: creator.city,
        profile: creator.creatorProfile,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        clientName: r.inquiry.client.name || 'Anonymous Client',
      })),
      canReview: reviewEligibility,
      eligibleInquiryId,
    });
  } catch (error: any) {
    console.error('Error fetching creator details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 505 });
  }
}
