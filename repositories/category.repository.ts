import { prisma } from '@/lib/prisma';

export class CategoryRepository {
  async getAll() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }
}