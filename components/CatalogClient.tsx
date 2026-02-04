'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

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
  createdAt: Date;
}

interface CatalogProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogClient({ initialProducts, categories }: CatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. ВИЗНАЧАЄМО МАКСИМАЛЬНУ ЦІНУ
  const maxGlobalPrice = Math.max(...initialProducts.map(p => Number(p.price)), 1000);
  const minGlobalPrice = 0;

  // === СТАНИ ===
  const [products, setProducts] = useState(initialProducts);
  
  // Отримуємо параметри з URL
  const initialCategory = searchParams.get('category') || 'all';
  
  // 👇 ОТРИМУЄМО ПОШУКОВИЙ ЗАПИТ
  const searchQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([minGlobalPrice, maxGlobalPrice]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Синхронізація URL (якщо змінилась категорія або пошук в адресному рядку)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setSelectedCategory(categoryFromUrl || 'all');
  }, [searchParams]);

  // === ГОЛОВНА ЛОГІКА ФІЛЬТРАЦІЇ ===
  useEffect(() => {
    let result = [...initialProducts];

    // 1. 👇 ПОШУК (Це найважливіше нововведення)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerQuery)
        // Можна додати пошук по категорії, якщо треба:
        // || p.category.name.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Категорія (Фільтруємо, тільки якщо не обрано "всі")
    // Але якщо є пошуковий запит, іноді категорію скидають, але тут залишимо комбінацію
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.slug === selectedCategory);
    }

    // 3. Розмір
    if (selectedSize !== 'all') {
      result = result.filter(p => p.sizes.includes(selectedSize));
    }

    // 4. ЦІНА
    result = result.filter(p => {
      const price = Number(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // 5. Сортування
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setProducts(result);
  }, [selectedCategory, selectedSize, priceRange, sortOrder, initialProducts, searchQuery]); // 👈 Додали searchQuery в залежності

  const changeCategory = (slug: string) => {
    setSelectedCategory(slug);
    // При зміні категорії скидаємо пошук (опціонально, але логічно)
    if (slug === 'all') {
      router.push('/catalog', { scroll: false });
    } else {
      router.push(`/catalog?category=${slug}`, { scroll: false });
    }
  };

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Структура сайдбару (скорочено для читабельності, ваш код тут залишається таким самим)
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
      
      {/* Мобільна кнопка */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-slate-900"
        >
          Фільтри та Категорії
        </button>
      </div>

      {/* === САЙДБАР === */}
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

        {/* ФІЛЬТР ЦІНИ */}
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

        {/* Фільтр Розмірів */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm">Розмір</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSize('all')} className={`px-3 py-2 text-sm rounded-lg border transition ${selectedSize === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-gray-200'}`}>Всі</button>
            {allSizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-2 text-sm rounded-lg border transition ${selectedSize === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-gray-200'}`}>{size}</button>
            ))}
          </div>
        </div>
      </aside>

      {/* === ТОВАРИ === */}
      <div className="flex-grow">
        
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
                {/* 👇 ВІДОБРАЖЕННЯ ЗАГОЛОВКУ ПРИ ПОШУКУ */}
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
          
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer text-right text-slate-900">
            <option value="newest">Спочатку нові</option>
            <option value="price-asc">Дешеві</option>
            <option value="price-desc">Дорогі</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ПОВІДОМЛЕННЯ ПРО ПУСТИЙ РЕЗУЛЬТАТ */}
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
                 router.push('/catalog'); // Скидаємо все, включаючи пошук
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