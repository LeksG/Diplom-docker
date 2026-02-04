'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useEffect, useState } from 'react';

// 👇 Оновлений тип
interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  sizes?: string[];  // <---
  colors?: string[]; // <---
}

export default function WishlistButton({ product, className = "" }: { product: Product, className?: string }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={`w-9 h-9 ${className}`}></div>;

  const isActive = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={`flex items-center justify-center transition-all ${className} ${
        isActive ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
      title={isActive ? "Видалити з бажаного" : "Додати в бажане"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" height="20" 
        viewBox="0 0 24 24" 
        fill={isActive ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}