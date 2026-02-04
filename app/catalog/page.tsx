import { prisma } from '@/lib/prisma';
import CatalogClient from '@/components/CatalogClient';

// Цей рядок змушує сторінку оновлюватись при кожному вході
export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const rawProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // === ПЕРЕТВОРЮЄМО DECIMAL В NUMBER ===
    const products = rawProducts.map((product) => ({
      ...product,
      price: Number(product.price), // Конвертуємо явно
    }));

    const categories = await prisma.category.findMany();

    return { products, categories };
  } catch (error) {
    console.error("Помилка завантаження каталогу:", error);
    return { products: [], categories: [] };
  }
}

export default async function CatalogPage() {
  const { products, categories } = await getData();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 pt-10 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-2">
            Каталог
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Передаємо вже оброблені продукти (де price - це число) */}
        <CatalogClient initialProducts={products} categories={categories} />
      </div>
    </main>
  );
}