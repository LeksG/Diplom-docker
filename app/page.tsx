import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: 10, 
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(product => ({
    ...product,
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
      
      {/* 1. (Головний банер) */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Фонове відео або картинка */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black/30"></div> 
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto drop-shadow-2xl">
          <span className="bg-white/90 backdrop-blur text-slate-900 px-6 py-2 rounded-full font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-8 inline-block shadow-lg">
            НОВА КОЛЕКЦІЯ 2026
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-lg">
            ВІДКРИЙ СВІЙ <br /> СТИЛЬ
          </h1>
          <p className="text-white text-lg md:text-2xl mb-12 max-w-xl mx-auto font-medium drop-shadow-md opacity-90">
            Одяг, що підкреслює твою індивідуальність.
          </p>
          
          <Link 
            href="/catalog" 
            className="px-12 py-5 bg-white text-slate-900 font-bold text-lg rounded-full hover:bg-slate-100 transition shadow-2xl hover:scale-105 active:scale-95 inline-block"
          >
            Перейти до каталогу
          </Link>
        </div>
      </section>

      {/* 2. КАТЕГОРІЇ  */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-12 text-center uppercase">Для кого обираєш?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ЧОЛОВІКАМ */}
          <Link href="/catalog?gender=men" className="relative h-[500px] group overflow-hidden rounded-[2rem] shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop" 
              alt="Men" 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <span className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-wide text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                Чоловікам
              </span>
            </div>
          </Link>

          {/* ЖІНКАМ */}
          <Link href="/catalog?gender=women" className="relative h-[500px] group overflow-hidden rounded-[2rem] shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=800&auto=format&fit=crop" 
              alt="Women" 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <span className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-wide text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                Жінкам
              </span>
            </div>
          </Link>

          {/* ВСІ КАТЕГОРІЇ */}
          <Link href="/catalog" className="relative h-[500px] group overflow-hidden rounded-[2rem] shadow-lg ">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" 
              alt="All Categories" 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
               <span className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-wide text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                Всі категорії
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. ОСТАННІ ТОВАРИ  */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4"> 
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Нові надходження</h2>
              <p className="text-gray-500 mt-2 text-lg">Свіжі моделі цього сезону</p>
            </div>
            <Link href="/catalog" className="hidden md:flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition group">
              Всі новинки 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Адаптивна сітка товарів */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
             <Link href="/catalog" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold w-full block">
                Дивитись всі новинки
             </Link>
          </div>

        </div>
      </section>
    </main>
  );
}