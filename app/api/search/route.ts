import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

const productService = new ProductService();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const results = await productService.searchProducts(query);
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}