import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  let userId: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Dev Fallback: return mock profile if userId starts with "mock-"
    if (userId.startsWith('mock-')) {
      const isCreator = userId.includes('creator');
      return NextResponse.json({
        user: {
          id: userId,
          name: isCreator ? 'Mock Creative Creator' : 'Mock Client Recruiter',
          email: `${userId}@example.com`,
          phone: '+918252792846',
          role: isCreator ? 'creator' : 'client',
          city: 'Mumbai',
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
          creatorProfile: isCreator ? {
            categories: ['Singer', 'Dancer', 'Makeup Artist'],
            bio: 'This is a mock creator biography for local development testing.',
            city: 'Mumbai',
            priceRangeMin: 2000,
            priceRangeMax: 10000,
            serviceType: 'booking',
            verified: false,
            instagramUrl: 'instagram.com/mock',
            youtubeUrl: 'youtube.com/mock',
            whatsappNumber: '+918252792846'
          } : null
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found', needsOnboarding: true }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching profile API:', error);
    
    // Catch database connection failures and return a mock client user in development
    // to prevent crashes on dashboard guards
    if (userId && userId.startsWith('mock-')) {
      const isCreator = userId.includes('creator');
      return NextResponse.json({
        user: {
          id: userId,
          name: 'Offline Dev User',
          phone: '+918252792846',
          role: isCreator ? 'creator' : 'client',
          city: 'Mumbai',
          creatorProfile: isCreator ? {
            categories: ['Singer'],
            bio: 'Offline mock profile.',
            city: 'Mumbai',
            priceRangeMin: 1000,
            priceRangeMax: 5000,
            serviceType: 'both',
            verified: false
          } : null
        }
      });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
