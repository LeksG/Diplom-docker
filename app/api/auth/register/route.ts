import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; 
import { RegisterSchema } from '@/lib/validation';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json(); 


    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      
      const exactErrorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: exactErrorMessage }, { status: 400, headers: corsHeaders });
    }

    
    const { email, password, fullName } = result.data; 

   
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким Email вже існує' },
        { status: 409, headers: corsHeaders }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 10); 

  
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, 
        fullName: fullName, 
      },
    });

    return NextResponse.json({ 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.fullName 
    }, { status: 201, headers: corsHeaders });
    
  } catch (error: any) {
    console.error("ПОМИЛКА РЕЄСТРАЦІЇ:", error); 
    
    return NextResponse.json(
      { error: error.message || 'Внутрішня помилка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}