'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Тип товару
export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string | null;
  size: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, size: string, color?: string) => void;
  clearCart: () => void; 
  isCartOpen: boolean;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Функція для динамічного ключа
  const getCartKey = useCallback(() => {
    if (typeof window === 'undefined') return 'cart_guest';
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return `cart_${user.email}`; // Ключ виду cart_stas@test.com
      } catch {
        return 'cart_guest';
      }
    }
    return 'cart_guest';
  }, []);

  // 2. Функція завантаження даних
  const loadCart = useCallback(() => {
    const key = getCartKey();
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Помилка парсингу кошика', e);
        setItems([]);
      }
    } else {
      setItems([]); // Якщо для цього юзера ще немає кошика
    }
    setIsLoaded(true);
  }, [getCartKey]);

  // 3. Ефект при першому завантаженні та зміні акаунта
  useEffect(() => {
    loadCart();

    // Слухаємо подію входу/виходу (StorageEvent працює між вкладками)
    const handleAuthChange = () => {
      setIsLoaded(false);
      loadCart();
    };

    window.addEventListener('storage', handleAuthChange);
    // Додаємо власну подію для миттєвого оновлення в межах однієї вкладки
    window.addEventListener('user-auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('user-auth-change', handleAuthChange);
    };
  }, [loadCart]);

  // 4. Збереження даних при зміні items
  useEffect(() => {
    if (isLoaded) {
      const key = getCartKey();
      localStorage.setItem(key, JSON.stringify(items));
    }
  }, [items, isLoaded, getCartKey]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (existing) {
        return prev.map((i) => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, size: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.color === color)));
  };

  const clearCart = () => {
    const key = getCartKey();
    setItems([]); 
    localStorage.removeItem(key);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isCartOpen, toggleCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}