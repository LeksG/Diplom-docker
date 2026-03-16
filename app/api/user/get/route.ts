import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    
    const userDataHeader = req.headers.get('user-data');
    
    if (!userDataHeader) {
      return NextResponse.json(
        { message: 'Дані користувача відсутні в заголовках' }, 
        { status: 401 }
      );
    }


    let decodedUser;
    try {
      decodedUser = JSON.parse(userDataHeader);
    } catch (e) {
      return NextResponse.json(
        { message: 'Невалідний формат даних користувача' }, 
        { status: 400 }
      );
    }


    const user = await prisma.user.findUnique({
      where: { email: decodedUser.email },
      select: {
        id: true,
        email: true,
        fullName: true, 
        phone: true,    
        city: true,     
        address: true,  
        role: true,
      }
    });


    if (!user) {
      return NextResponse.json(
        { message: 'Користувача не знайдено в базі даних' }, 
        { status: 404 }
      );
    }


    return NextResponse.json(user, { status: 200 });

  } catch (error: any) {
    console.error("API USER GET ERROR:", error);
    return NextResponse.json(
      { message: 'Помилка сервера', details: error.message }, 
      { status: 500 }
    );
  }
}