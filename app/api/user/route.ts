import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';

const userService = new UserService();

// Отримання профілю користувача
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await userService.getUserFromToken(authHeader);
    
    return NextResponse.json(user);
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN' ? 401 : 404;
    return NextResponse.json({ message: error.message }, { status });
  }
}


export async function PATCH(req: Request) {
  try {

    const authHeader = req.headers.get('authorization');
    const currentUser = await userService.getUserFromToken(authHeader);
    
    
    const body = await req.json();

    const updatedUser = await userService.updateProfile(currentUser.email, body);
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('🔥 Помилка PATCH /api/user:', error);
    

    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ message: 'Неавторизований доступ' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Помилка оновлення профілю' }, { status: 500 });
  }
}