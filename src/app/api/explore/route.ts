import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const verified = searchParams.get('verified') === 'true';

    // Build filter clauses for CreatorProfile
    const profileFilters: any = {};

    if (city) {
      profileFilters.city = {
        equals: city,
        mode: 'insensitive',
      };
    }

    if (priceMin) {
      profileFilters.priceRangeMin = {
        gte: parseFloat(priceMin),
      };
    }

    if (priceMax) {
      profileFilters.priceRangeMax = {
        lte: parseFloat(priceMax),
      };
    }

    if (verified) {
      profileFilters.verified = true;
    }

    // Filter categories array (has target tag or containing search string)
    if (category) {
      profileFilters.categories = {
        hasSome: [category],
      };
    }

    // Query User table for role creator, joining CreatorProfile
    const creators = await prisma.user.findMany({
      where: {
        role: 'creator',
        creatorProfile: {
          isNot: null,
          is: Object.keys(profileFilters).length > 0 ? profileFilters : undefined,
        },
      },
      include: {
        creatorProfile: {
          include: {
            portfolioItems: true,
          },
        },
        creatorInquiries: {
          include: {
            reviews: true,
          },
        },
      },
    });

    // Format output and calculate average ratings
    const formattedCreators = creators.map((creator) => {
      // Collect all reviews
      const reviews = creator.creatorInquiries
        .flatMap((inq) => inq.reviews);

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return {
        id: creator.id,
        name: creator.name,
        city: creator.city,
        creatorProfile: creator.creatorProfile,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewsCount: reviews.length,
      };
    });

    // Handle fallback string match inside bio or name if tag-specific array search yielded no results
    // (useful for generalized search queries from homepage input)
    let results = formattedCreators;
    if (category && results.length === 0) {
      const fallbackCreators = await prisma.user.findMany({
        where: {
          role: 'creator',
          creatorProfile: {
            isNot: null,
          },
          OR: [
            {
              creatorProfile: {
                bio: {
                  contains: category,
                  mode: 'insensitive',
                },
              },
            },
            {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          creatorProfile: {
            include: {
              portfolioItems: true,
            },
          },
          creatorInquiries: {
            include: {
              reviews: true,
            },
          },
        },
      });

      results = fallbackCreators.map((creator) => {
        const reviews = creator.creatorInquiries.flatMap((inq) => inq.reviews);
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        return {
          id: creator.id,
          name: creator.name,
          city: creator.city,
          creatorProfile: creator.creatorProfile,
          averageRating: parseFloat(averageRating.toFixed(1)),
          reviewsCount: reviews.length,
        };
      });
    }

    return NextResponse.json({ creators: results });
  } catch (error: any) {
    console.error('Error fetching explore results:', error);
    return NextResponse.json({ creators: [], error: 'Database connection offline' });
  }
}
