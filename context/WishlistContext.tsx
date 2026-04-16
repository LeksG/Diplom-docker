'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  slug?: string;
  category?: { name: string; slug: string };
  sizes?: string[];  
  colors?: string[]; 
}

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Функція для отримання динамічного ключа (прив'язка до email)
  const getWishlistKey = useCallback(() => {
    if (typeof window === 'undefined') return 'wishlist_guest';
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return `wishlist_${user.email}`; // Ключ виду wishlist_stas@test.com
      } catch {
        return 'wishlist_guest';
      }
    }
    return 'wishlist_guest';
  }, []);

  // 2. Функція завантаження списку бажань
  const loadWishlist = useCallback(() => {
    const key = getWishlistKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Помилка парсингу списку бажань', e);
        setItems([]);
      }
    } else {
      setItems([]); // Порожній список, якщо для юзера ще немає даних
    }
    setIsLoaded(true);
  }, [getWishlistKey]);

  // 3. Ефект при першому завантаженні та відстеження зміни акаунта
  useEffect(() => {
    loadWishlist();

    const handleAuthChange = () => {
      setIsLoaded(false);
      loadWishlist();
    };

    // Слухаємо стандартну подію та нашу кастомну (яку ми додали для кошика)
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('user-auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('user-auth-change', handleAuthChange);
    };
  }, [loadWishlist]);

  // 4. Збереження даних при зміні списку бажань
  useEffect(() => {
    if (isLoaded) {
      const key = getWishlistKey();
      localStorage.setItem(key, JSON.stringify(items));
    }
  }, [items, isLoaded, getWishlistKey]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: number) => {
    return items.some((item) => item.id === id);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}