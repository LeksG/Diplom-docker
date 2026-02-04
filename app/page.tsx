import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: 12, 
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(product => ({
    ...product,
    // 👇 1. ВИПРАВЛЕННЯ: Конвертуємо ОБИДВІ ціни
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    sizes: product.sizes || [],
    colors: product.colors || []
  }));
}

export default async function Home() {
  const products = await getLatestProducts();

  return (
    <main className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto drop-shadow-lg">
          <span className="bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-full font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-6 inline-block shadow-sm">
            ВЕСНЯНА КОЛЕКЦІЯ 2026
          </span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-6 leading-[0.9] tracking-tighter mix-blend-overlay">
            SPRING <br /> VIBES
          </h1>
          <p className="text-white text-xl md:text-2xl mb-10 max-w-xl mx-auto font-medium drop-shadow-md">
            Легкість. Кольори. Нова енергія твого стилю.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog" className="px-12 py-5 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition shadow-2xl hover:shadow-white/50">
              Дивитись Новинки
            </Link>
          </div>
        </div>
      </section>

      {/* 2. КАТЕГОРІЇ */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-12 text-center">ОБЕРИ КАТЕГОРІЮ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/catalog?gender=men" className="relative h-[400px] group overflow-hidden rounded-3xl">
            <img src="https://images.unsplash.com/photo-1516257984-b1b4d8c9230e?auto=format&fit=crop&w=800&q=80" alt="Men" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex items-end p-8">
              <span className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-sm group-hover:px-8 transition-all">Чоловікам</span>
            </div>
          </Link>
          <Link href="/catalog?gender=women" className="relative h-[400px] group overflow-hidden rounded-3xl">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" alt="Women" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex items-end p-8">
              <span className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-sm group-hover:px-8 transition-all">Жінкам</span>
            </div>
          </Link>
          <Link href="/catalog?category=men-hoodies" className="relative h-[400px] group overflow-hidden rounded-3xl">
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80" alt="Hoodies" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex items-end p-8">
              <span className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-sm group-hover:px-8 transition-all">Худі Collection</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. ОСТАННІ ТОВАРИ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4"> 
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Весняний Дроп</h2>
              <p className="text-gray-500 mt-2">Будь першим, хто це одягне</p>
            </div>
            <Link href="/catalog" className="hidden md:block text-blue-600 font-bold hover:underline">
              Дивитись всі →
            </Link>
          </div>

          {/* 👇 2. ВИПРАВЛЕННЯ СІТКИ */}
          {/* grid-cols-2 (моб) -> md:grid-cols-3 (планшет) -> lg:grid-cols-4 (ноут) -> xl:grid-cols-5 (великий екран) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}