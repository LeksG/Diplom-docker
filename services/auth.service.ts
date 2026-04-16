import { UserRepository } from '@/repositories/user.repository';
import { AuthResponseDTO } from '@/dto/auth.dto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export class AuthService {
  private userRepo = new UserRepository();

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('Користувач не знайдений');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Невірний пароль');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role
      }
    };
  }

  async register(data: any) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) throw new Error('USER_EXISTS');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return await this.userRepo.create({
      ...data,
      password: hashedPassword
    });
  }
}