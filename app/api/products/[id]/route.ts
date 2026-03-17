import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

const productService = new ProductService();


export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID' }, { status: 400 });
    }

    const product = await productService.getOne(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА GET /api/products/[id]:`, error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}


export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

  
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено: потрібні права адміністратора' }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);
    const body = await req.json();

    const updatedProduct = await productService.updateProduct(productId, body);
    
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА PATCH /api/products/[id]:`, error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера', details: error.message }, 
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = req.headers.get('user-data');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    await productService.removeProduct(productId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`🔥 ПОМИЛКА DELETE /api/products/[id]:`, error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}