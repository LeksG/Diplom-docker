
import { prisma } from '@/lib/prisma';

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
  
  async update(email: string, data: any) {
    return await prisma.user.update({
      where: { email },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address
      }
    });
  }

  async create(data: { email: string; passwordHash: string; fullName?: string }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        fullName: data.fullName,
      },
    });
  }
}