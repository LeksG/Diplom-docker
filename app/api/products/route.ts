import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// 1. GET LIST
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true,
        variants: true 
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 2. CREATE PRODUCT (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 API Create Body:", body);

    const { 
      title, description, price, 
      oldPrice,
      imageUrl, categoryId, 
      variants 
    } = body;

    if (!title || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let allSizes: string[] = [];
    let allColors: string[] = [];
    let totalStock = 0;
    
    // 👇 FIX: Explicit type definition here
    let variantsData: { size: string; color: string; stock: number }[] = [];

    if (variants && Array.isArray(variants) && variants.length > 0) {
      totalStock = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0);
      allSizes = [...new Set(variants.map((v: any) => v.size))].filter(Boolean) as string[];
      allColors = [...new Set(variants.map((v: any) => v.color))].filter(Boolean) as string[];

      variantsData = variants.map((v: any) => ({
        size: v.size,
        color: v.color,
        stock: Number(v.stock)
      }));
    } else {
      if (body.stock) totalStock = Number(body.stock);
      if (body.sizes) allSizes = body.sizes;
      if (body.colors) allColors = body.colors;
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
        category: {
          connect: { id: Number(categoryId) }
        },
        variants: variantsData.length > 0 ? {
          create: variantsData
        } : undefined
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json(newProduct);

  } catch (error: any) {
    console.error("🔥 API POST Error:", error);
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
  }
}