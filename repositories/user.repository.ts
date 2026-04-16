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
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address
      }
    });
  }

  async create(data: { email: string; password: string; firstName: string; lastName: string; middleName?: string }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
  
        middleName: data.middleName || "", 
      },
    });
  }
}