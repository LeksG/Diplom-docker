import { NextResponse } from 'next/server';
import { EmailService } from '@/services/email.service';

const emailService = new EmailService();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.contactInfo || !body.message) {
      return NextResponse.json({ error: 'Всі поля обов\'язкові' }, { status: 400 });
    }

    const data = await emailService.sendContactEmail(body);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Contact Error:', error);
    return NextResponse.json({ error: 'Помилка відправки' }, { status: 500 });
  }
}