import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Fetch user and profile details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: {
          include: {
            portfolioItems: true,
          },
        },
      },
    });

    if (!user || user.role !== 'creator') {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const profile = user.creatorProfile;
    if (!profile) {
      return NextResponse.json({ error: 'Creator profile not created yet', needsOnboarding: true }, { status: 404 });
    }

    // Calculate completeness
    let completeness = 0;
    if (user.name) completeness += 20;
    if (profile.bio && profile.bio.length > 10) completeness += 20;
    if (profile.city) completeness += 20;
    if (profile.categories && profile.categories.length > 0) completeness += 20;
    if (profile.portfolioItems && profile.portfolioItems.length > 0) completeness += 20;

    // Fetch inquiry metrics
    const inquiries = await prisma.inquiry.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
      },
    });

    const pendingCount = inquiries.filter(i => i.status === 'pending').length;
    const acceptedCount = inquiries.filter(i => i.status === 'accepted').length;
    const completedCount = inquiries.filter(i => i.status === 'completed').length;
    const totalCount = inquiries.length;

    // Fetch reviews for rating calculation
    const reviews = await prisma.review.findMany({
      where: {
        inquiry: {
          creatorId: userId,
        },
      },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      profile: {
        name: user.name,
        verified: profile.verified,
        completeness,
        categories: profile.categories,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewsCount: reviews.length,
      },
      stats: {
        totalCount,
        pendingCount,
        acceptedCount,
        completedCount,
      },
      recentInquiries: inquiries.slice(0, 5).map(i => ({
        id: i.id,
        clientName: i.client.name,
        clientPhone: i.client.phone,
        category: i.category,
        message: i.message,
        eventDate: i.eventDate,
        status: i.status,
        createdAt: i.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
