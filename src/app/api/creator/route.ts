import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const prisma = (await import('@/lib/prisma')).default;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId'); // Optional: check eligibility to write review

    if (!id) {
      return NextResponse.json({ error: 'Missing creator ID' }, { status: 400 });
    }

    // Offline Dev Mode Fallback:
    // If using mock credentials, return deterministic creator profile details instead of crashing!
    if (id.startsWith('mock-')) {
      const mockCreator = {
        id,
        name: 'Priya Mehandi Designer',
        city: 'Delhi NCR',
        phone: '+919876543210',
        creatorProfile: {
          userId: id,
          categories: ['Mehndi Artist', 'Bridal Makeup'],
          bio: 'Specialist in beautiful designer bridal mehndi, Arabic mehndi patterns, and traditional festival mehndi layouts. Over 5 years of verified experience styling top weddings in Delhi NCR.',
          city: 'Delhi NCR',
          priceRangeMin: 5000,
          priceRangeMax: 15000,
          serviceType: 'booking',
          verified: true,
          instagramUrl: 'https://instagram.com',
          youtubeUrl: 'https://youtube.com',
          whatsappNumber: '919876543210',
          portfolioItems: [
            {
              id: 'p1',
              mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
              mediaType: 'image',
              caption: 'Bridal Mehndi Full Hand design',
            },
            {
              id: 'p2',
              mediaUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600',
              mediaType: 'image',
              caption: 'Elegant Arabic Pattern',
            }
          ]
        }
      };

      return NextResponse.json({
        creator: mockCreator,
        reviews: [
          {
            id: 'rev1',
            rating: 5,
            comment: 'Absolutely stunning work! Priya designed my wedding mehndi and everyone loved the patterns.',
            createdAt: new Date().toISOString(),
            inquiry: {
              client: {
                name: 'Anjali Sharma',
              }
            }
          }
        ],
        canReview: true,
        eligibleInquiryId: 'mock-inquiry-123',
      });
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
    return NextResponse.json({ creator: null, reviews: [], error: 'Database connection offline' });
  }
}
