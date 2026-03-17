import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

const authService = new AuthService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUser = await authService.register(body);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    let status = 400;
    let errorMessage = 'Внутрішня помилка сервера при реєстрації';

  
    if (error.message === 'USER_EXISTS') {
      status = 409;
      errorMessage = 'Користувач з таким Email вже існує';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status });
  }
}