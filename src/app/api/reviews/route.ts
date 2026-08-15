import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const prisma = (await import('@/lib/prisma')).default;
  try {
    const data = await request.json();
    const { inquiryId, rating, comment } = data;

    if (!inquiryId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing review parameters' }, { status: 400 });
    }

    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify inquiry exists and is completed
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry || inquiry.status !== 'completed') {
      return NextResponse.json({ error: 'Reviews can only be left for completed bookings.' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        inquiryId,
        rating: numericRating,
        comment,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
