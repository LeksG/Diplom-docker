'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartModal() {
  const { isCartOpen, toggleCart, items, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      ></div>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        
        {/* Шапка */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-slate-900 uppercase">Мій кошик</h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-200 rounded-full">
            ✕
          </button>
        </div>

        {/* Список товарів */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-4xl mb-2">🛒</p>
              <p>Кошик порожній</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 border-b pb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Розмір: {item.size} {item.color && `| ${item.color}`}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold text-blue-600">{item.price} ₴</p>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Підвал з кнопкою */}
        {items.length > 0 && (
          <div className="p-5 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-black text-slate-900">
              <span>Разом:</span>
              <span>{cartTotal} ₴</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={toggleCart} 
              className="block w-full py-4 bg-slate-900 text-white text-center font-bold rounded-xl hover:bg-slate-800 transition"
            >
              ОФОРМИТИ ЗАМОВЛЕННЯ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}