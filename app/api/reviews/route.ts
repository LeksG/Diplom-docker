
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, email, rating, comment, parentId } = body;


    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 401 });
    }


    if (!parentId) {
      const existingReview = await prisma.review.findFirst({
        where: { 
          userId: user.id, 
          productId: Number(productId), 
          parentId: null 
        }
      });

      if (existingReview) {
        return NextResponse.json({ error: 'Ви вже оцінили цей товар' }, { status: 400 });
      }
    }

 
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId: user.id, 
        productId: Number(productId),
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: { select: { fullName: true } } 
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}