import { NextResponse } from 'next/server';
import { productService } from '@/services/product.service'; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Неправильний формат ID' }, { status: 400, headers: corsHeaders });
    }

    const product = await productService.getProductById(id);
    return NextResponse.json(product, { status: 200, headers: corsHeaders });
    
  } catch (error: any) {
    console.error("🔥 GET [id] Error:", error);
    if (error.message === 'ProductNotFound') {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Неправильний формат ID' }, { status: 400, headers: corsHeaders });
    }

    await productService.deleteProduct(id);
    return new NextResponse(null, { status: 204, headers: corsHeaders });
    
  } catch (error: any) {
    console.error("🔥 DELETE [id] Error:", error);
    if (error.message === 'ProductNotFound') {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}