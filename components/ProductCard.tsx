'use client';

import Link from 'next/link';
import WishlistButton from './WishlistButton';

interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  slug?: string;
  category?: { name: string; slug: string };
  sizes?: string[];
  colors?: string[];
  stock?: number;
  
  // 👇 Список доступних розмірів
  availableSizes?: string[];
  // 👇 НОВЕ: Список доступних кольорів
  availableColors?: string[];
}

const colorMap: Record<string, string> = {
  'чорний': '#000000', 'black': '#000000',
  'білий': '#ffffff', 'white': '#ffffff',
  'сірий': '#808080', 'grey': '#808080',
  'бежевий': '#f5f5dc', 'beige': '#f5f5dc',
  'синій': '#1e3a8a', 'blue': '#1e3a8a',
  'червоний': '#dc2626', 'red': '#dc2626',
  'зелений': '#16a34a', 'green': '#16a34a',
  'жовтий': '#fbbf24', 'yellow': '#fbbf24',
};

export default function ProductCard({ product }: { product: Product }) {
  const discountPercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const hasOptions = (product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0);

  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <div className={`group flex flex-col w-full bg-transparent ${isOutOfStock ? 'opacity-75' : ''}`}>
      
      {/* 1. БЛОК ФОТО */}
      <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-xl overflow-hidden mb-3 shadow-sm transition-all hover:shadow-md">
        
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No Photo
            </div>
          )}
        </Link>

        {/* ❤️ СЕРДЕЧКО */}
        <div className="absolute top-3 right-3 z-30">
          <div className="text-white filter drop-shadow-[0_0_1px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
             <WishlistButton 
               product={product} 
               className="w-7 h-7 flex items-center justify-center hover:text-red-600 transition-colors" 
             />
          </div>
        </div>

        {/* 🏷️ БЕЙДЖІ */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 transition-opacity duration-300 group-hover:opacity-0">
            {isOutOfStock ? (
                <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    РОЗПРОДАНО
                </div>
            ) : discountPercentage ? (
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    -{discountPercentage}%
                </div>
            ) : null}
            
            {!isOutOfStock && !discountPercentage && (
                 <div className="bg-green-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    В НАЯВНОСТІ
                 </div>
            )}
        </div>

        {/* 🎢 ВИЇЖДЖАЮЧА ПАНЕЛЬ */}
        {hasOptions && !isOutOfStock && (
          <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 
                          transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
            
            <div className="flex flex-col gap-2 items-center">
              
              {/* 👇 КОЛЬОРИ З ПЕРЕВІРКОЮ НАЯВНОСТІ 👇 */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {product.colors.map((color) => {
                     const bg = colorMap[color.toLowerCase()] || color;
                     const isWhite = bg === '#ffffff' || color.toLowerCase() === 'білий';
                     
                     // Перевіряємо наявність кольору
                     const isAvailable = product.availableColors 
                        ? product.availableColors.includes(color) 
                        : true;

                     return (
                       <div key={color} className="relative w-4 h-4">
                           {/* Кружечок кольору */}
                           <div 
                             className={`
                               w-full h-full rounded-full shadow-sm border 
                               ${isWhite ? 'border-gray-300' : 'border-transparent'}
                               ${!isAvailable ? 'opacity-40' : ''} 
                             `} 
                             style={{ backgroundColor: bg }}
                             title={color}
                           />
                           
                           {/* Червона лінія, якщо кольору немає */}
                           {!isAvailable && (
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="w-[120%] h-[1.5px] bg-red-500 rotate-[-45deg] shadow-sm"></span>
                                </span>
                           )}
                       </div>
                     );
                  })}
                </div>
              )}

              {/* 👇 РОЗМІРИ З ПЕРЕВІРКОЮ НАЯВНОСТІ 👇 */}
              {product.sizes && product.sizes.length > 0 && (
                 <div className="flex flex-wrap gap-1 justify-center">
                   {product.sizes.map((size) => {
                     const isAvailable = product.availableSizes 
                        ? product.availableSizes.includes(size) 
                        : true; 

                     return (
                       <span 
                         key={size} 
                         className={`
                           text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase relative
                           ${isAvailable 
                              ? 'text-slate-700 bg-white border-gray-200' 
                              : 'text-gray-300 bg-gray-50 border-gray-100'
                           }
                         `}
                       >
                         {size}
                         {!isAvailable && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="w-full h-[1px] bg-red-400 rotate-[-15deg]"></span>
                            </span>
                         )}
                       </span>
                     );
                   })}
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. ІНФОРМАЦІЯ */}
      <div className="flex flex-col px-1">
        <Link href={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-slate-900 text-[13px] leading-tight line-clamp-2 group-hover:text-blue-600 transition font-normal">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-[14px]">
          <span className={`font-bold ${isOutOfStock ? 'text-gray-400' : (discountPercentage ? 'text-red-600' : 'text-slate-900')}`}>
            {product.price} грн
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-gray-400 text-xs line-through decoration-gray-400">
              {product.oldPrice} грн
            </span>
          )}
        </div>
      </div>
    </div>
  );
}