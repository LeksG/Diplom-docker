import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CheckboxService } from '@/services/checkbox.service';

// Ініціалізуємо Stripe з нашою "заглушкою" для збірки Докера
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: Request) {
  const payload = await req.text(); // Отримуємо сирий текст для верифікації
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Відсутній підпис або секрет' }, { status: 400 });
    }
    
    // Перевіряємо, чи дійсно цей запит прийшов від Stripe
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Помилка Webhook підпису:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Обробляємо подію успішної оплати
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // 1. Stripe за замовчуванням не передає список товарів у вебхуку. 
      // Нам треба запросити їх додатково (expand: ['line_items'])
      const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      
      const lineItems = sessionWithItems.line_items?.data || [];

      // 2. Форматуємо товари зі Stripe у формат, який розуміє наш CheckboxService
      const formattedItems = lineItems.map((item) => ({
        product: {
          id: item.price?.product as string, // ID товару в Stripe
          title: item.description,           // Назва
          // Stripe зберігає ціни в копійках/центах. Ділимо на кількість, щоб отримати ціну за 1 шт.
          price: item.amount_total / (item.quantity || 1) / 100, 
        },
        quantity: item.quantity || 1,
      }));

      // Дістаємо пошту клієнта, яку він вказав при оплаті
      const customerEmail = session.customer_details?.email || 'test@example.com';

      // 3. Відправляємо дані у Checkbox для створення фіскального чека
      const checkboxService = new CheckboxService();
      const receipt = await checkboxService.createReceipt(formattedItems, customerEmail);

      if (receipt) {
        console.log('✅ Фіскальний чек успішно створено! URL:', receipt.receipt_url);
        // ТУТ МОЖНА ОНОВИТИ СТАТУС ЗАМОВЛЕННЯ В БАЗІ ДАНИХ
      }

    } catch (error) {
      console.error('❌ Помилка обробки успішної оплати:', error);
      return NextResponse.json({ error: 'Помилка генерації чека' }, { status: 500 });
    }
  }

  // Обов'язково повертаємо 200 статус, щоб Stripe знав, що ми все отримали
  return NextResponse.json({ received: true });
}