import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// 1. ОТРИМАТИ ОДИН ТОВАР (GET)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true,
        variants: true, // Варіанти (SKU)
        images: true    // 👇 НОВЕ: Підтягуємо додаткові фото
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 2. ОНОВИТИ ТОВАР (UPDATE/PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log(`📝 Оновлення товару ID ${id}...`);

    const { 
      title, description, price, 
      oldPrice, imageUrl, categoryId, 
      variants, // Масив варіантів (розміри/кольори)
      images    // 👇 НОВЕ: Масив додаткових фото [{url, color}]
    } = body;

    // --- 1. РОЗРАХУНОК ДАНИХ (Stock, Sizes, Colors) ---
    let totalStock = 0;
    let allSizes: string[] = [];
    let allColors: string[] = [];
    let availableSizes: string[] = [];

    // Якщо прийшли варіанти — перераховуємо все на їх основі
    if (variants && Array.isArray(variants) && variants.length > 0) {
        
        // Рахуємо загальну кількість
        totalStock = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0);

        // Збираємо унікальні розміри та кольори для фільтрів
        allSizes = [...new Set(variants.map((v: any) => v.size))].filter(Boolean) as string[];
        allColors = [...new Set(variants.map((v: any) => v.color))].filter(Boolean) as string[];

        // "Доступні розміри" — це тільки ті, де кількість > 0
        availableSizes = [...new Set(
            variants
            .filter((v: any) => Number(v.stock) > 0)
            .map((v: any) => v.size)
        )] as string[];

    } else {
        // Fallback, якщо варіантів немає
        if (body.stock) totalStock = Number(body.stock);
        if (body.sizes) allSizes = body.sizes;
        if (body.availableSizes) availableSizes = body.availableSizes;
        if (body.colors) allColors = body.colors;
    }

    // --- 2. ОНОВЛЕННЯ В БАЗІ ---
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        imageUrl, // Головне фото
        
        // Оновлюємо розрахункові дані
        stock: totalStock,
        sizes: allSizes,
        colors: allColors,
        availableSizes: availableSizes.length > 0 ? availableSizes : [], 

        // Категорія
        category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,

        // ОНОВЛЕННЯ ВАРІАНТІВ (SKU)
        variants: {
            deleteMany: {}, 
            create: variants?.map((v: any) => ({
                size: v.size,
                color: v.color,
                stock: Number(v.stock)
            })) || []
        },

        // 👇 НОВЕ: ОНОВЛЕННЯ ГАЛЕРЕЇ ФОТО
        images: {
            deleteMany: {}, // Видаляємо старі
            create: images?.map((img: any) => ({
                url: img.url,
                color: img.color // Прив'язка до кольору (може бути null)
            })) || []
        }
      },
    });

    console.log("✅ Товар успішно оновлено!");
    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("🔥 API Update Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 3. ВИДАЛИТИ ТОВАР (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Prisma сама видалить variants та images (через Cascade delete)
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 API Delete Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}