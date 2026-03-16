import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();


    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });


    await prisma.order.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting order' }, { status: 500 });
  }
}