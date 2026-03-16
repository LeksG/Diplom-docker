import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, comment, rating } = body;

  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });

   
    const review = await prisma.review.findUnique({ where: { id: Number(id) } });
    if (!review) return NextResponse.json({ error: 'Відгук не знайдено' }, { status: 404 });


    const isAuthor = review.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Немає прав' }, { status: 403 });
    }


    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: { comment, rating: Number(rating) },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Помилка редагування:", error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });

    const review = await prisma.review.findUnique({ where: { id: Number(id) } });
    if (!review) return NextResponse.json({ error: 'Відгук не знайдено' }, { status: 404 });


    const isAuthor = review.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Немає прав' }, { status: 403 });
    }

    await prisma.review.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Помилка видалення:", error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}