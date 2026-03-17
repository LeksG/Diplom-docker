import { UserRepository } from '@/repositories/user.repository';
import { UpdateUserDto } from '@/dto/user.dto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export class UserService {
  private repository = new UserRepository();

  async getUserFromToken(authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    try {
     
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      const user = await this.repository.findByEmail(decoded.email);
      if (!user) throw new Error('NOT_FOUND');

  
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (err) {
      throw new Error('INVALID_TOKEN');
    }
  }

  async updateProfile(email: string, updateData: UpdateUserDto) {

    return await this.repository.update(email, updateData);
  }
}