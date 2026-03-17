import { prisma } from '@/lib/prisma';

export class ProductRepository {
  async findAll() {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, variants: true, images: true }
    });
  }

  async findById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, images: true }
    });
  }

  async create(data: any) {
    return await prisma.product.create({
      data,
      include: { variants: true, images: true }
    });
  }

  async update(id: number, data: any) {
    return await prisma.product.update({
      where: { id },
      data,
      include: { variants: true, images: true, category: true }
    });
  }

  async delete(id: number) {
    return await prisma.product.delete({ where: { id } });
  }

async search(query: string) {
  return await prisma.product.findMany({
    where: {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 5,
    select: {
      id: true,
      title: true,
      price: true,
      imageUrl: true,
      category: { select: { name: true } }
    },
  });
}
}


