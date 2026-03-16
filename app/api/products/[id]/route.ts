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

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'ADMIN' ? decoded : 'FORBIDDEN';
  } catch (err) {
    return null;
  }
}


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true,
        variants: true,
        images: true 
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(product, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders });
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminStatus = await verifyAdmin(req);
    if (!adminStatus) return NextResponse.json({ error: '401 Unauthorized' }, { status: 401, headers: corsHeaders });
    if (adminStatus === 'FORBIDDEN') return NextResponse.json({ error: '403 Forbidden' }, { status: 403, headers: corsHeaders });

    const { id } = await params;
    const body = await req.json();
    const { title, description, price, oldPrice, imageUrl, categoryId, variants, images } = body;

    let totalStock = 0, allSizes: string[] = [], allColors: string[] = [], availableSizes: string[] = [];

    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0);
      allSizes = [...new Set(variants.map((v: any) => v.size))].filter(Boolean) as string[];
      allColors = [...new Set(variants.map((v: any) => v.color))].filter(Boolean) as string[];
      availableSizes = variants.filter((v: any) => Number(v.stock) > 0).map((v: any) => v.size);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title, description,
        price: price ? Number(price) : undefined,
        oldPrice: oldPrice ? Number(oldPrice) : null,
        imageUrl, stock: totalStock,
        sizes: allSizes, colors: allColors,
        availableSizes: availableSizes.length > 0 ? availableSizes : [],
        category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
        variants: variants ? {
          deleteMany: {},
          create: variants.map((v: any) => ({ size: v.size, color: v.color, stock: Number(v.stock) }))
        } : undefined,
        images: images ? {
          deleteMany: {},
          create: images.map((img: any) => ({ url: img.url, color: img.color || null }))
        } : undefined
      },
    });

    return NextResponse.json(updatedProduct, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminStatus = await verifyAdmin(req);
    if (!adminStatus) return NextResponse.json({ error: '401 Unauthorized' }, { status: 401, headers: corsHeaders });
    if (adminStatus === 'FORBIDDEN') return NextResponse.json({ error: '403 Forbidden' }, { status: 403, headers: corsHeaders });

    const { id } = await params;
    
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders });
  }
}