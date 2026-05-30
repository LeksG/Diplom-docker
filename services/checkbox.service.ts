export class CheckboxService {
  private apiUrl = process.env.CHECKBOX_API_URL;

  // 1. Авторизація касира
  private async signIn(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/cashier/signin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Client-Name': 'ShopDiploma', // Обов'язкова вимога Checkbox
        'X-Client-Version': '1.0.0'      // Обов'язкова вимога Checkbox
      },
      body: JSON.stringify({
        login: process.env.CHECKBOX_LOGIN,
        password: process.env.CHECKBOX_PASSWORD,
      }),
    });

    if (!response.ok) {
      // Тепер ми витягуємо СПРАВЖНЮ причину помилки від сервера Checkbox
      const errorText = await response.text();
      console.error('❌ ДЕТАЛІ ПОМИЛКИ CHECKBOX SIGN-IN:', errorText);
      throw new Error(`Помилка авторизації Checkbox: ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  }

  // 2. Створення чека
  async createReceipt(items: any[], customerEmail: string) {
    try {
      // Отримуємо токен
      const token = await this.signIn();

      // Формуємо масив товарів для чека (з урахуванням можливих розбіжностей у фронтенді)
      const goods = items.map(item => {
        const productData = item.product || item;
        return {
          good: {
            code: productData.id || '0000', // Унікальний код товару
            name: productData.title || 'Товар без назви',
            price: Math.round((productData.price || 0) * 100), // Checkbox приймає ціну в копійках
          },
          quantity: (item.quantity || 1) * 1000, // Кількість у тисячних долях (1 шт = 1000)
        };
      });

      // Відправляємо запит на створення чека
      const response = await fetch(`${this.apiUrl}/receipts/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-License-Key': process.env.CHECKBOX_LICENSE_KEY || '',
        },
        body: JSON.stringify({
          goods: goods,
          delivery: {
            emails: [customerEmail], // Checkbox сам відправить чек клієнту на пошту
          },
          payments: [
            {
              type: 'CASHLESS', // Безготівкова оплата
              value: goods.reduce((acc, curr) => acc + (curr.good.price * (curr.quantity / 1000)), 0),
              label: 'Оплата карткою'
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Помилка створення чека (receipts/sell):', errorData);
        throw new Error('Не вдалося створити чек');
      }

      const receipt = await response.json();
      return receipt; 

    } catch (error) {
      console.error('🚨 Checkbox API Error:', error);
      return null; 
    }
  }
}