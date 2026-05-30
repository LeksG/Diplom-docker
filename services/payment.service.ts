import Stripe from 'stripe';
import { CheckoutRequestDTO } from '@/dto/checkout.dto';

// Додали || 'sk_test_dummy' щоб Докер не сварився під час збірки!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-01-27.acacia' as any, 
});

export class PaymentService {
  async createCheckoutSession(data: CheckoutRequestDTO) {
    const line_items = data.items.map((item: any) => {
      // Робимо код універсальним: беремо item.product, а якщо його немає - беремо сам item
      const productData = item.product || item;

      return {
        price_data: {
          currency: 'uah',
          product_data: {
            name: productData.title || 'Товар без назви', // Беремо назву з правильного місця
            images: productData.imageUrl ? [productData.imageUrl] : [],
          },
          unit_amount: Math.round((productData.price || 0) * 100), // Беремо ціну з правильного місця
        },
        quantity: item.quantity || 1,
      };
    });

    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: data.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/profile?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/cart?status=canceled`,
    });
  }
}