import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, contactInfo, message } = await req.json();

    if (!name || !contactInfo || !message) {
      return NextResponse.json({ error: 'Всі поля обов\'язкові' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', 
      to: ['grand781278@gmail.com'], 
      subject: `Нове повідомлення з сайту від ${name}`,
      html: `
        <h2>Нове повідомлення з форми контактів</h2>
        <p><strong>Ім'я:</strong> ${name}</p>
        <p><strong>Контакти:</strong> ${contactInfo}</p>
        <p><strong>Повідомлення:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Помилка відправки:', error);
      return NextResponse.json({ error: 'Помилка відправки листа' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Помилка сервера:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}