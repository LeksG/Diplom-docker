import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Дістаємо нові поля shippingMethod та paymentMethod
    const { 
      customerName, customerPhone, customerAddress, customerEmail, 
      cartItems, totalPrice, shippingMethod, paymentMethod 
    } = body;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        customerEmail: customerEmail || null,
        shippingMethod, // <--- ЗБЕРІГАЄМО ДОСТАВКУ
        paymentMethod,  // <--- ЗБЕРІГАЄМО ОПЛАТУ
        totalPrice: totalPrice,
        status: 'NEW',
        items: {
          create: cartItems.map((item: any) => ({
            productTitle: item.title,
            price: item.price,
            quantity: item.quantity || 1,
            size: item.size,
            color: item.color
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}