'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AuthModal from './AuthModal'; 
import { useWishlist } from '@/context/WishlistContext';
import{ UserService, ProductService} from '@/services/api';
import Cookies from 'js-cookie';

interface SearchResult {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
  category: { name: string };
}

// ОКРЕМИЙ КОМПОНЕНТ ДЛЯ ПАРАМЕТРІВ (ВИРІШУЄ ПОМИЛКУ VERCEL)
function AuthParamHandler({ setIsAuthOpen }: { setIsAuthOpen: (val: boolean) => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setIsAuthOpen(true);
      // Очищаємо URL від ?auth=true, щоб модалка не з'являлася знову при рефреші
      router.replace(pathname);
    }
  }, [searchParams, pathname, router, setIsAuthOpen]);

  return null;
}

export default function Header() {
  const { cartCount, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist(); 
  
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  //  ЛОГІКА ПЕРЕВІРКИ КОРИСТУВАЧА 
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const userData = await UserService.getCurrentUser();
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
      }
    };

    initAuth();
    setIsSearchOpen(false); 
    setSearchQuery('');
    setSearchResults([]);
  }, [pathname]);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'grand78122@gmail.com';

  // ЛОГІКА ЖИВОГО ПОШУКУ
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await ProductService.search(searchQuery);
          setSearchResults(data);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* ДОДАНО ОБГОРТКУ SUSPENSE */}
      <Suspense fallback={null}>
        <AuthParamHandler setIsAuthOpen={setIsAuthOpen} />
      </Suspense>

      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="relative flex h-20 items-center justify-between px-6 max-w-[1920px] mx-auto">
          
          {/* ВІКНО ПОШУКУ */}
          {isSearchOpen ? (
            <div className="absolute inset-0 z-50 bg-white flex items-start pt-5 px-6 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xl">
              <div className="w-full max-w-4xl mx-auto relative">
                
                <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-4 border-b-2 border-gray-100 pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Почніть вводити назву товару..." 
                    className="flex-grow text-xl outline-none text-slate-900 placeholder-gray-400 bg-transparent font-medium"
                    autoFocus
                  />
                  {isSearching && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>}
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="text-gray-500 hover:text-red-600 transition ml-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl border border-t-0 border-gray-100 overflow-hidden z-50">
                    {searchResults.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                           {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Фото</div>
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{product.title}</h4>
                          <p className="text-xs text-gray-500">{product.category.name}</p>
                          <span className="text-blue-600 font-bold text-sm">{product.price} ₴</span>
                        </div>
                      </Link>
                    ))}
                    <button 
                      onClick={handleSearchSubmit}
                      className="w-full py-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition uppercase tracking-wide"
                    >
                      Показати всі результати
                    </button>
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                   <div className="absolute top-full left-0 w-full bg-white p-4 text-center text-gray-500 text-sm shadow-xl rounded-b-xl">
                      Нічого не знайдено
                   </div>
                )}

              </div>
            </div>
          ) : (
            <>
              {/* ЛОГОТИП */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-3xl font-black tracking-tighter uppercase text-slate-900">
                  FIRMOVUY
                </Link>
              </div>

              {/* НАВІГАЦІЯ */}
              <nav className="hidden md:flex gap-8 h-full items-center">
                {/* ЧОЛОВІКАМ */}
                <div className="group relative h-full flex items-center">
                  <Link href="/catalog?gender=men" className="text-sm font-bold text-slate-900 hover:text-blue-600 uppercase tracking-wide py-8">Чоловікам</Link>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-4 z-50">
                    <div className="flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
                      <Link href="/catalog?category=men-hoodies" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Худі та Світшоти</Link>
                      <Link href="/catalog?category=men-pants" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Штани</Link>
                      <Link href="/catalog?category=men-tshirts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Футболки та Поло</Link>
                      <Link href="/catalog?category=men-suits" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Спортивні костюми</Link>
                      <Link href="/catalog?category=men-shirts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Сорочки</Link>
                      <Link href="/catalog?category=men-jackets" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Куртки</Link>
                      <Link href="/catalog?category=men-shorts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Шорти</Link>
                      <Link href="/catalog?category=men-coats" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Пальто</Link>
                    </div>
                  </div>
                </div>

                {/* ЖІНКАМ */}
                <div className="group relative h-full flex items-center">
                  <Link href="/catalog?gender=women" className="text-sm font-bold text-slate-900 hover:text-blue-600 uppercase tracking-wide py-8">Жінкам</Link>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-4 z-50">
                    <div className="flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
                      <Link href="/catalog?category=women-hoodies" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Худі та Світшоти</Link>
                      <Link href="/catalog?category=women-pants" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Штани</Link>
                      <Link href="/catalog?category=women-tshirts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Футболки та Поло</Link>
                      <Link href="/catalog?category=women-suits" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Спортивні костюми</Link>
                      <Link href="/catalog?category=women-dresses" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Сукні</Link>
                      <Link href="/catalog?category=women-tops" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Топи</Link>
                      <Link href="/catalog?category=women-shirts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Сорочки</Link>
                      <Link href="/catalog?category=women-jackets" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Куртки</Link>
                      <Link href="/catalog?category=women-shorts" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Шорти</Link>
                      <Link href="/catalog?category=women-coats" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium">Пальто</Link>
                    </div>
                  </div>
                </div>

                <Link href="/about" className="text-sm font-bold text-slate-900 hover:text-blue-600 uppercase tracking-wide py-8">Про нас</Link>
              </nav>

              {/* ІКОНКИ */}
              <div className="flex items-center gap-2 md:gap-3">
                
                <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition text-slate-900" title="Пошук">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>

                {isAdmin && (
                  <Link href="/admin" className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-700 transition"><span>ADMIN</span></Link>
                )}

                {/* ЛОГІКА ІКОНКИ ПРОФІЛЮ ТА ВИХОДУ */}
                {user ? (
                  <div className="flex items-center gap-1">
                    <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition text-slate-900" title="Кабінет">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition text-slate-900" title="Увійти">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                  </button>
                )}

                <Link href="/profile?tab=favorites" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition relative text-slate-900 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  {wishlistItems.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{wishlistItems.length}</span>}
                </Link>

                <button onClick={toggleCart} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition relative text-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
                </button>

              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}