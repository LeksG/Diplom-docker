import { NextResponse } from 'next/server';
import { productService } from '@/services/product.service';
import { CreateProductSchema } from '@/dto/product.dto';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const products = await productService.getAllProducts();

    return NextResponse.json(products, { status: 200, headers: corsHeaders });
  } catch (error) {

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    

    const validationResult = CreateProductSchema.safeParse(body);
    if (!validationResult.success) {

      return NextResponse.json({ error: validationResult.error.issues }, { status: 400, headers: corsHeaders });
    }


    const newProduct = await productService.createProduct(validationResult.data);
    

    return NextResponse.json(newProduct, { status: 201, headers: corsHeaders });
  } catch (error) {
  
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}