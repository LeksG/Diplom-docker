import { prisma } from '@/lib/prisma'; 
import { Prisma } from '@prisma/client';

export class ProductRepository {
  
  // Отримати всі товари 
  async findAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true,
        variants: true,
        images: true 
      }
    });
  }

  // Отримати один товар за ID
  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        variants: true,
        images: true 
      }
    });
  }

  // Створити новий товар
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: { 
        category: true,
        variants: true,
        images: true 
      }
    });
  }

  // Видалити товар
  async delete(id: number) {
    return prisma.product.delete({
      where: { id }
    });
  }
}

// Експортуємо єдиний екземпляр класу
export const productRepository = new ProductRepository();