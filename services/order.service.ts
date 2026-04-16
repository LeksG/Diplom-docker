import { OrderRepository } from '@/repositories/order.repository';
import { CreateOrderDto, UpdateOrderDto } from '@/dto/order.dto';

export class OrderService {
  private repository = new OrderRepository();

  async createOrder(body: CreateOrderDto) {
    const { cartItems, ...orderData } = body;
    
    
    const formattedItems = cartItems.map((item) => ({
      productId: Number(item.id),
      productTitle: item.title,
      price: Number(item.price), 
      quantity: item.quantity ? Number(item.quantity) : 1,
      size: item.size || null,
      color: item.color || null
    }));

    return await this.repository.create({
      ...orderData,
      status: 'NEW',
      items: formattedItems
    });
  }

  // Отримання замовлень конкретного користувача (по email)
  async getOrders(email: string) {
    if (!email) return [];
    return await this.repository.findByEmail(email);
  }

  // Отримання ВСІХ замовлень (для Адмін-панелі)
  async getAllOrders() {
    return await this.repository.findAll(); 
  }

  async updateOrder(id: number, updateData: UpdateOrderDto) {
    return await this.repository.update(id, updateData);
  }

  async removeOrder(id: number) {
    return await this.repository.delete(id);
  }
}