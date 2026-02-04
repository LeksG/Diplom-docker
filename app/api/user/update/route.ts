import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, phone, country, city, address } = body;

    // Оновлюємо користувача за його email
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        fullName,
        phone,
        country,
        city,
        address
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Помилка оновлення' }, { status: 500 });
  }
}