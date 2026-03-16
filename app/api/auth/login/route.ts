import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const dynamic = 'force-dynamic';


export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Користувач не знайдений' },
        { status: 401, headers: corsHeaders } 
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Невірний пароль' },
        { status: 401, headers: corsHeaders } 
      );
    }

 
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' } 
    );

    return NextResponse.json(
      {
        token, 
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role
        }
      },
      { status: 200, headers: corsHeaders } 
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Помилка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}