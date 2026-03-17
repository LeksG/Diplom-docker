import { NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';

const orderService = new OrderService();

export async function POST(req: Request) {
  try {
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

    const body = await req.json();

    const orderData = {
      ...body,
      customerEmail: user?.email || body.customerEmail
    };

    if (!orderData.customerEmail) {
      return NextResponse.json(
        { error: 'Email обов’язковий для оформлення замовлення' }, 
        { status: 400 }
      );
    }

    const order = await orderService.createOrder(orderData);
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("🔥 ПОМИЛКА POST /api/order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
   
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');

  
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;


    const emailToSearch = user?.email || queryEmail;

    if (!emailToSearch) {
      return NextResponse.json({ error: 'Email не вказано' }, { status: 400 });
    }

    let orders;

    if (user?.role === 'ADMIN' && !queryEmail) {
    
      orders = await orderService.getAllOrders(); 
    } else {
     
      orders = await orderService.getOrders(emailToSearch);
    }


    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error("🔥 ПОМИЛКА GET /api/order:", error);
    return NextResponse.json({ error: 'Помилка отримання замовлень' }, { status: 500 });
  }
}