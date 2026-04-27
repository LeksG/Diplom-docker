import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    const paymentService = new PaymentService();
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 });
    }

    const session = await paymentService.createCheckoutSession(body);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}