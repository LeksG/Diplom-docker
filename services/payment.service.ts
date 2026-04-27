import Stripe from 'stripe';
import { CheckoutRequestDTO } from '@/dto/checkout.dto';

// Додали || 'sk_test_dummy' щоб Докер не сварився під час збірки!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
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
      // Тут також можна додати fallback, щоб не було undefined під час білду
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart?status=canceled`,
    });
  }
}