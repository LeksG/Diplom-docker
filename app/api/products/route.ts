import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export const dynamic = 'force-dynamic';

const productService = new ProductService();

// 👇 Оновлений метод GET (тепер приймає req та читає параметр color)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const color = searchParams.get('color');

    const products = await productService.getAll({ color });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("🔥 ПОМИЛКА GET /api/products:", error);
    return NextResponse.json(
      { error: 'Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}

// 👇 Метод POST залишився без жодних змін (перевірка адміна працює як і раніше)
export async function POST(req: Request) {
  try {
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ заборонено: тільки адміністратор може створювати товари' }, 
        { status: 403 }
      );
    }

    const body = await req.json();
    const newProduct = await productService.createProduct(body);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("🔥 ПОМИЛКА POST /api/products:", error);
    return NextResponse.json(
      { error: 'Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}