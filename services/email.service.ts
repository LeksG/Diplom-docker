import { Resend } from 'resend';
import { ContactFormDTO } from '@/dto/contact.dto';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  async sendContactEmail(data: ContactFormDTO) {
    const { name, contactInfo, message } = data;

    const result = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['grand781278@gmail.com'],
      subject: `Нове повідомлення від ${name}`,
      html: `
        <h2>Нове повідомлення з форми контактів</h2>
        <p><strong>Ім'я:</strong> ${name}</p>
        <p><strong>Контакти:</strong> ${contactInfo}</p>
        <p><strong>Повідомлення:</strong> ${message}</p>
      `,
    });

    if (result.error) {
      throw new Error('EMAIL_SEND_FAILED');
    }

    return result.data;
  }
}