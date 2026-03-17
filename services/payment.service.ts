import Stripe from 'stripe';
import { CheckoutRequestDTO } from '@/dto/checkout.dto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any, 
});

export class PaymentService {
  async createCheckoutSession(data: CheckoutRequestDTO) {
    const line_items = data.items.map((item) => ({
      price_data: {
        currency: 'uah',
        product_data: {
          name: item.product.title,
          images: item.product.imageUrl ? [item.product.imageUrl] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: data.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?status=canceled`,
    });
  }
}