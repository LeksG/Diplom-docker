'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import SortDropdown from '@/components/SortDropdown';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
  category: Category;
  sizes: string[];
  colors: string[]; // Поле для кольорів
  createdAt: Date;
}

interface CatalogProps {
  initialProducts: Product[];
  categories: Category[];
}

function CatalogContent({ initialProducts, categories }: CatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const maxGlobalPrice = Math.max(...initialProducts.map(p => Number(p.price)), 1000);
  const minGlobalPrice = 0;
  
  const [products, setProducts] = useState(initialProducts);
  const initialCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([minGlobalPrice, maxGlobalPrice]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setSelectedCategory(categoryFromUrl || 'all');
  }, [searchParams]);

  useEffect(() => {
    let result = [...initialProducts];

    // Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerQuery)
      );
    }

    // Фільтр Категорій
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.slug === selectedCategory);
    }

    // Фільтр Розмірів
    if (selectedSize !== 'all') {
      result = result.filter(p => p.sizes?.includes(selectedSize));
    }

    // Фільтр Кольорів
    if (selectedColor !== 'all') {
      result = result.filter(p => p.colors?.includes(selectedColor));
    }

    // Фільтр Ціни
    result = result.filter(p => {
      const price = Number(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Сортування
    if (sortOrder === 'price_asc' || sortOrder === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'price_desc' || sortOrder === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setProducts(result);
  }, [selectedCategory, selectedSize, selectedColor, priceRange, sortOrder, initialProducts, searchQuery]);

  const changeCategory = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      router.push('/catalog', { scroll: false });
    } else {
      router.push(`/catalog?category=${slug}`, { scroll: false });
    }
  };

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  // Автоматично збираємо всі унікальні кольори
  const allColors = Array.from(new Set(initialProducts.flatMap(p => p.colors || []))).filter(Boolean);

  // Словник кольорів для кружечків
  const colorMap: Record<string, string> = {
    'чорний': '#000000',
    'білий': '#FFFFFF',
    'червоний': '#ef4444',
    'синій': '#3b82f6',
    'зелений': '#22c55e',
    'бежевий': '#f5f5dc',
    'сірий': '#6b7280',
    'рожевий': '#ec4899',
    'жовтий': '#eab308',
    'коричневий': '#92400e',
    'блакитний': '#0ea5e9'
  };

  const sidebarStructure = [
    {
      title: "ЧОЛОВІКАМ",
      items: [
        { name: "Худі та Світшоти", slug: "men-hoodies" },
        { name: "Штани", slug: "men-pants" },
        { name: "Футболки та Поло", slug: "men-tshirts" },
        { name: "Спортивні костюми", slug: "men-suits" },
        { name: "Сорочки", slug: "men-shirts" },
        { name: "Куртки", slug: "men-jackets" },
        { name: "Шорти", slug: "men-shorts" },
        { name: "Пальто", slug: "men-coats" },
        { name: "Взуття / Кросівки", slug: "men-sneakers" },
      ]
    },
    {
      title: "ЖІНКАМ",
      items: [
        { name: "Худі", slug: "women-hoodies" },
        { name: "Штани", slug: "women-pants" },
        { name: "Футболки та Поло", slug: "women-tshirts" },
        { name: "Спортивні костюми", slug: "women-suits" },
        { name: "Сукні", slug: "women-dresses" },
        { name: "Топи", slug: "women-tops" },
        { name: "Сорочки", slug: "women-shirts" },
        { name: "Куртки", slug: "women-jackets" },
        { name: "Шорти", slug: "women-shorts" },
        { name: "Пальто", slug: "women-coats" },
        { name: "Взуття", slug: "women-shoes" },
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-slate-900"
        >
          Фільтри та Категорії
        </button>
      </div>

      <aside className={`lg:w-64 flex-shrink-0 space-y-8 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
        <button 
          onClick={() => changeCategory('all')}
          className={`w-full text-left font-bold uppercase tracking-wide py-2 transition 
            ${selectedCategory === 'all' ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'}`}
        >
          Всі товари
        </button>

        {sidebarStructure.map((group, idx) => (
          <div key={idx}>
            <h3 className="font-bold text-slate-900 mb-3 uppercase text-sm border-b border-gray-100 pb-2">
              {group.title}
            </h3>
            <div className="space-y-2 flex flex-col">
              {group.items.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => changeCategory(item.slug)}
                  className={`text-left text-sm transition py-1
                    ${selectedCategory === item.slug 
                      ? 'font-bold text-blue-600 pl-2 border-l-2 border-blue-600' 
                      : 'text-gray-600 hover:text-slate-900'
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-gray-100">
          <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm">Ціна (ГРН)</h3>
          <div className="flex items-center gap-2 mb-4">
            <input 
              type="number" min={0} max={maxGlobalPrice} value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full p-2 border rounded-lg text-sm text-center font-bold bg-gray-50 text-slate-900 focus:bg-white outline-none"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" min={0} max={maxGlobalPrice} value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full p-2 border rounded-lg text-sm text-center font-bold bg-gray-50 text-slate-900 focus:bg-white outline-none"
            />
          </div>
          <input 
            type="range" min={0} max={maxGlobalPrice} step={10} value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm">Розмір</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSize('all')} className={`px-3 py-2 text-sm rounded-lg border transition ${selectedSize === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-gray-200'}`}>Всі</button>
            {allSizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-2 text-sm rounded-lg border transition ${selectedSize === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-gray-200'}`}>{size}</button>
            ))}
          </div>
        </div>

        {/* Блок кольорів (Кружечки) */}
        {allColors.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm">Колір</h3>
            <div className="flex flex-wrap gap-3 items-center">
              
              <button 
                onClick={() => setSelectedColor('all')} 
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  selectedColor === 'all' 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                Всі
              </button>

              {allColors.map((color) => {
                const hexColor = colorMap[color] || '#e5e7eb'; 
                const isActive = selectedColor === color;

                return (
                  <button 
                    key={color} 
                    onClick={() => setSelectedColor(color)} 
                    title={color}
                    className={`w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0 relative
                      ${isActive 
                        ? 'ring-2 ring-offset-2 ring-slate-900 shadow-md scale-110 border-transparent' 
                        : 'border border-gray-300 hover:scale-110 hover:shadow-sm'
                      }
                    `}
                    style={{ backgroundColor: hexColor }}
                  >
                    {!colorMap[color] && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                        {color.charAt(0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </aside>

      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
                {searchQuery ? (
                  <>Пошук: <span className="text-blue-600">"{searchQuery}"</span></>
                ) : selectedCategory === 'all' ? (
                  'Всі товари'
                ) : (
                  sidebarStructure.flatMap(g => g.items).find(i => i.slug === selectedCategory)?.name || 'Категорія'
                )}
            </h2>
            <span className="text-gray-400 text-sm font-normal">Знайдено товарів: {products.length}</span>
          </div>
          <SortDropdown value={sortOrder} onChange={setSortOrder} /> 
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 mb-2">
                {searchQuery 
                  ? `За запитом "${searchQuery}" нічого не знайдено` 
                  : "Товарів за вибраними фільтрами не знайдено"}
            </p>
            <button 
              onClick={() => {
                  router.push('/catalog');
                  setSelectedSize('all');
                  setSelectedColor('all'); 
                  setPriceRange([minGlobalPrice, maxGlobalPrice]);
              }} 
              className="text-blue-600 font-bold hover:underline"
            >
              Скинути всі фільтри
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogClient(props: CatalogProps) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Завантаження каталогу...</div>}>
      <CatalogContent {...props} />
    </Suspense>
  );
}