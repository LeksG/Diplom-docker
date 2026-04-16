import { prisma } from '@/lib/prisma';
import ProductClient from '@/components/ProductClient';
import ProductReviews from '@/components/ProductReviews';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProductData(idString: string) {
  const id = Number(idString);
  if (isNaN(id)) return null;

  try {
    // 1. Спочатку отримуємо продукт БЕЗ відгуків 
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { 
        category: true,
        variants: true,
        images: true,
      },
    });

    if (!product) return null;

    // 2. Окремо отримуємо ВСІ відгуки для цього товару 
    const flatReviews = await prisma.review.findMany({
      where: { productId: id },
      include: { 
        user: { select: { 
          firstName: true, 
          lastName: true } } 
      },
      orderBy: { createdAt: 'asc' } 
    });

    // 3. Функція для побудови дерева 
    const buildReviewTree = (reviews: any[]) => {
      const map = new Map();
      const roots: any[] = [];

      reviews.forEach(review => {
        map.set(review.id, { ...review, replies: [] });
      });

      reviews.forEach(review => {
        const node = map.get(review.id);
        if (review.parentId) {
          const parent = map.get(review.parentId);
          if (parent) {
            parent.replies.push(node);
          } else {
             roots.push(node);
          }
        } else {
          roots.push(node);
        }
      });

      return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const reviewTree = buildReviewTree(flatReviews);

    // 4. Схожі товари
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });

    // 5. Формуємо фінальні дані
    const availableSizes = [
      ...new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.size))
    ];
    const finalAvailableSizes = availableSizes.length > 0 ? availableSizes : (product.availableSizes || []);

    return {
      mainProduct: {
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        availableSizes: finalAvailableSizes,
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images || [],
        reviews: reviewTree 
      },
      relatedProducts: relatedProducts.map(p => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        category: { slug: p.category.slug }
      }))
    };

  } catch (error) {
    console.error("🔥 Помилка бази даних:", error);
    return null;
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const data = await getProductData(params.id);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-black text-slate-900 mb-2">❌ Товар не знайдено</h1>
        <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          На головну
        </a>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen pb-20">
       {/* Основний клієнтський компонент (фото, вибір розміру, купити) */}
       <ProductClient 
          product={data.mainProduct} 
          relatedProducts={data.relatedProducts} 
       />

       {/* 3. БЛОК ВІДГУКІВ */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductReviews 
            productId={data.mainProduct.id} 
            reviews={data.mainProduct.reviews} 
          />
       </div>
    </main>
  );
}