import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // <--- Імпорт

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Якщо юзера немає
    if (!user) {
      return NextResponse.json(
        { message: 'Користувач не знайдений' },
        { status: 401 }
      );
    }

    // ПЕРЕВІРКА ПАРОЛЯ (Порівнюємо введений пароль із зашифрованим у базі)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Невірний пароль' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.fullName,
    });

  } catch (error) {
    return NextResponse.json(
      { message: 'Помилка сервера' },
      { status: 500 }
    );
  }
}