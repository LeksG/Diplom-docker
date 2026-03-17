import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

const authService = new AuthService();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const result = await authService.login(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}