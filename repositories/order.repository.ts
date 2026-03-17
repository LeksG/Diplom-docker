import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';


export interface RepoCreateOrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string | null;
  shippingMethod: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  items: {
    productTitle: string;
    price: number;
    quantity: number;
    size?: string | null;
    color?: string | null;
  }[];
}

export class OrderRepository {
  async create(data: RepoCreateOrderData) {
    const { items, ...orderInfo } = data;
    
    return await prisma.order.create({
      data: {
        ...orderInfo,
        items: { create: items }
      }
    });
  }

 
  async findAll() {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
  }

  
  async findByEmail(email: string) {
    if (!email) return []; 
    
    return await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
  }

  async update(id: number, data: Prisma.OrderUpdateInput) {
    return await prisma.order.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    return await prisma.order.delete({ where: { id } });
  }
}