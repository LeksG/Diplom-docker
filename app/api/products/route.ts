import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true,
        variants: true,
        images: true 
      }
    });
    
    const formattedProducts = products.map((p: any) => {
      const uniqueColors = Array.from(new Set(p.variants.map((v: any) => v.color)));
      return { ...p, colors: uniqueColors };
    });

    return NextResponse.json(formattedProducts, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders });
  }
}


export async function POST(req: Request) {
  try {

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '401 Unauthorized: No token' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: '401 Unauthorized: Invalid token' }, { status: 401, headers: corsHeaders });
    }


    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden: Admins only' }, { status: 403, headers: corsHeaders });
    }

    
    const body = await req.json();
    const { title, description, price, oldPrice, imageUrl, categoryId, variants, images } = body;

    if (!title || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }


    let totalStock = 0;
    let allSizes: string[] = [];
    let allColors: string[] = [];
    let variantsData: any[] = [];

    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0);
      allSizes = [...new Set(variants.map((v: any) => v.size))].filter(Boolean) as string[];
      allColors = [...new Set(variants.map((v: any) => v.color))].filter(Boolean) as string[];
      variantsData = variants.map((v: any) => ({
        size: v.size,
        color: v.color,
        stock: Number(v.stock)
      }));
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        imageUrl: imageUrl || '',
        stock: totalStock,
        sizes: allSizes,
        colors: allColors,
        availableSizes: allSizes, 
        category: { connect: { id: Number(categoryId) } },
        variants: variantsData.length > 0 ? { create: variantsData } : undefined,
        images: images && images.length > 0 ? {
          create: images.map((img: any) => ({
            url: img.url,
            color: img.color || null
          }))
        } : undefined
      },
      include: { variants: true, images: true }
    });

    return NextResponse.json(newProduct, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error("🔥 API POST Error:", error);
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}