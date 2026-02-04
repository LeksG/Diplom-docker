import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json([]);
    }

    // Шукаємо замовлення, де customerEmail співпадає
    const orders = await prisma.order.findMany({
      where: { 
        customerEmail: email 
      },
      orderBy: { createdAt: 'desc' }, // Нові зверху
      include: { items: true }        // Включаючи товари
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}