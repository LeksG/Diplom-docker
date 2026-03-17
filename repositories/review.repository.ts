import { prisma } from '@/lib/prisma';

export class ReviewRepository {
  async findById(id: number) {
    return await prisma.review.findUnique({ where: { id } });
  }

  async findExisting(userId: string, productId: number) {
    return await prisma.review.findFirst({
      where: { userId, productId, parentId: null }
    });
  }

  async create(data: any) {
    return await prisma.review.create({
      data,
      include: { user: { select: { fullName: true } } }
    });
  }

  async update(id: number, data: { comment?: string; rating?: number }) {
    return await prisma.review.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return await prisma.review.delete({ where: { id } });
  }
}