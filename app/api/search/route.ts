import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive', // Ігноруємо регістр (великі/малі літери)
        },
      },
      take: 5, // Беремо тільки 5 схожих товарів
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        category: {
            select: { name: true }
        }
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}