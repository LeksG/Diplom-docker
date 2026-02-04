import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, customerName, customerPhone, customerAddress } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status,           // Оновлюємо статус
        customerName,     // Оновлюємо ім'я
        customerPhone,    // Оновлюємо телефон
        customerAddress,  // Оновлюємо адресу
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 });
  }
}