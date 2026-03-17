import { NextResponse } from 'next/server';
import { ReviewService } from '@/services/review.service';

const reviewService = new ReviewService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const review = await reviewService.addReview(body);
    return NextResponse.json(review);
  } catch (error: any) {
    const status = error.message === 'ALREADY_REVIEWED' ? 400 : 401;
    return NextResponse.json({ error: error.message }, { status });
  }
}