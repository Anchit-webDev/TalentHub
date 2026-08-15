import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const prisma = (await import('@/lib/prisma')).default;
  try {
    const data = await request.json();
    const {
      userId,
      name,
      phone,
      email,
      city,
      categories,
      bio,
      priceRangeMin,
      priceRangeMax,
      serviceType,
      whatsappNumber,
      instagramUrl,
      youtubeUrl,
      portfolioItems,
    } = data;

    if (!userId || !phone || !city || !categories || !bio || priceRangeMin === undefined || priceRangeMax === undefined || !serviceType) {
      return NextResponse.json({ error: 'Missing required onboarding fields' }, { status: 400 });
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update User
      const user = await tx.user.upsert({
        where: { id: userId },
        update: {
          name,
          email: email || undefined,
          phone,
          city,
        },
        create: {
          id: userId,
          name,
          email: email || null,
          phone,
          role: 'creator',
          city,
        },
      });

      // 2. Create or update CreatorProfile
      const profile = await tx.creatorProfile.upsert({
        where: { userId },
        update: {
          categories,
          bio,
          city,
          priceRangeMin: parseFloat(priceRangeMin),
          priceRangeMax: parseFloat(priceRangeMax),
          serviceType,
          whatsappNumber,
          instagramUrl,
          youtubeUrl,
        },
        create: {
          userId,
          categories,
          bio,
          city,
          priceRangeMin: parseFloat(priceRangeMin),
          priceRangeMax: parseFloat(priceRangeMax),
          serviceType,
          whatsappNumber,
          instagramUrl,
          youtubeUrl,
          verified: false,
        },
      });

      // 3. Delete existing portfolio items to replace them (onboarding re-run or first set)
      await tx.portfolioItem.deleteMany({
        where: { creatorProfileId: userId },
      });

      // 4. Create new portfolio items
      if (portfolioItems && portfolioItems.length > 0) {
        await tx.portfolioItem.createMany({
          data: portfolioItems.map((item: any, idx: number) => ({
            creatorProfileId: userId,
            mediaUrl: item.mediaUrl,
            mediaType: item.mediaType,
            caption: item.caption || '',
            order: idx,
          })),
        });
      }

      return { user, profile };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error during onboarding transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
