import { NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';

const orderService = new OrderService();


export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Недійсний ID замовлення' }, { status: 400 });
    }
    
    const updatedOrder = await orderService.updateOrder(orderId, body);
    
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА PATCH /api/order/[id]:`, error);
    return NextResponse.json({ error: 'Помилка оновлення замовлення' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

   
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Недійсний ID замовлення' }, { status: 400 });
    }
    
    await orderService.removeOrder(orderId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА DELETE /api/order/[id]:`, error);
    return NextResponse.json({ error: 'Помилка видалення замовлення' }, { status: 500 });
  }
}