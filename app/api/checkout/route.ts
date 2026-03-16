import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 });
    }

    const line_items = items.map((item: any) => {

      const product = item.product || item; 
      
      const img = product.imageUrl || product.image || '';

      return {
        price_data: {
          currency: 'uah',
          product_data: {
            name: product.title, 
            images: img ? [img] : [],
          },
          unit_amount: Math.round(product.price * 100), 
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?status=canceled`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}