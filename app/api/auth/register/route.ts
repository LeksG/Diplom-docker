import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // <--- Імпорт

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Користувач з таким Email вже існує' },
        { status: 409 }
      );
    }

    // ШИФРУВАННЯ ПАРОЛЯ
    const hashedPassword = await bcrypt.hash(password, 10); // 10 - це сила шифрування

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // <--- Зберігаємо шифр, а не сам пароль
        fullName: name,
      },
    });

    return NextResponse.json({ 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.fullName 
    });
    
  } catch (error) {
    return NextResponse.json(
      { message: 'Помилка сервера' },
      { status: 500 }
    );
  }
}