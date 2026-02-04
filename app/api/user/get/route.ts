// app/api/user/get/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    // Шукаємо користувача в базі
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Повертаємо всі його дані (телефон, місто і т.д.)
    return NextResponse.json(user);
    
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}