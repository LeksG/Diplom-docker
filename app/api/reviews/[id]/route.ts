import { NextResponse } from 'next/server';
import { ReviewService } from '@/services/review.service';

const reviewService = new ReviewService();

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 1. Вказуємо Promise
) {
  try {
    const { id } = await params; // 2. Розпаковуємо params
    const body = await req.json();
    
    const result = await reviewService.checkAccessAndAction(
      Number(id), // 3. Використовуємо розпакований id
      body.email, 
      'update', 
      { comment: body.comment, rating: Number(body.rating) }
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА PATCH /api/reviews/[id]:`, error);
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await reviewService.checkAccessAndAction(
      Number(id), 
      body.email, 
      'delete'
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА DELETE /api/reviews/[id]:`, error);
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}