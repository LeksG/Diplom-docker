'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductService } from '@/services/api';

interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  category: { name: string } | null;
  imageUrl?: string;
  sizes: string[];
  availableSizes: string[];
  colors: string[];
}

const getColorStyle = (colorName: string) => {
  const map: Record<string, string> = {
    'білий': '#ffffff',
    'чорний': '#000000',
    'сірий': '#9ca3af',
    'бежевий': '#d2b48c',
    'синій': '#2563eb',
    'червоний': '#dc2626',
    'зелений': '#16a34a',
    'жовтий': '#ca8a04',
    'коричневий': '#78350f',
  };
  return map[colorName.toLowerCase()] || '#cbd5e1';
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

 const fetchProducts = async () => {
  try {
   
    const data = await ProductService.getAll();
    
    setProducts(data);
  } catch (error) {
    console.error('Помилка завантаження товарів:', error);
  
  } finally {
    setIsLoading(false);
  }
};

  const handleDelete = async (id: number) => {
  if (!confirm('Видалити цей товар?')) return;

  try {

    const data = await ProductService.delete(id); 

    if (data.success) {
      alert('Товар видалено!');
   
    } else {
      alert(`Помилка: ${data.error || data.message}`);
    }
  } catch (error) {
    console.error("Помилка видалення:", error);
  }
};

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Адмін-панель</h1>
          
          <div className="flex gap-6">
            <Link href="/admin" className="text-xl font-bold text-slate-900 border-b-2 border-slate-900">Товари</Link>
            <Link href="/admin/orders" className="text-xl font-bold text-gray-400 hover:text-slate-900 transition">Замовлення</Link>
          </div>
          
          <Link 
            href="/admin/add-product" 
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
          >
            <span>+</span> Додати товар
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 w-16">ID</th>
                <th className="p-4 w-20">Фото</th>
                <th className="p-4">Інфо</th>
                <th className="p-4">Склад</th>
                <th className="p-4">Кольори</th>
                <th className="p-4">Розміри</th>
                <th className="p-4">Ціна</th>
                <th className="p-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="p-10 text-center text-gray-500">Завантаження...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition group">
                  <td className="p-4 text-gray-400 text-xs font-mono">#{product.id}</td>
                  <td className="p-4">
                    <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="img" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">No img</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{product.title}</div>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {product.category?.name || 'Без категорії'}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.stock > 0 ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {product.stock} шт.
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        SOLD OUT
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2 overflow-hidden">
                       {product.colors && product.colors.length > 0 ? (
                         product.colors.map((color, idx) => (
                           <div 
                             key={idx} 
                             className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                             style={{ backgroundColor: getColorStyle(color) }}
                             title={color}
                           ></div>
                         ))
                       ) : (
                         <span className="text-gray-400 text-xs">-</span>
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {product.sizes && product.sizes.length > 0 ? product.sizes.map(size => {
                            const isAvailable = product.availableSizes?.includes(size);
                            return (
                                <span 
                                    key={size} 
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        isAvailable 
                                        ? 'bg-white border-gray-300 text-slate-700 font-bold' 
                                        : 'bg-gray-50 border-gray-100 text-gray-400 line-through decoration-red-400'
                                    }`}
                                >
                                    {size}
                                </span>
                            )
                        }) : <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className={`font-bold ${product.oldPrice ? 'text-red-600' : 'text-slate-900'}`}>
                            {product.price} ₴
                        </span>
                        {product.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                {product.oldPrice} ₴
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/product/${product.id}`} 
                          className="w-8 h-8 flex items-center justify-center bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 hover:text-yellow-800 transition"
                          title="Редагувати"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded hover:bg-red-100 hover:text-red-700 transition"
                          title="Видалити"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                           </svg>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isLoading && products.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">Товарів поки немає.</p>
              <Link href="/admin/add-product" className="text-blue-600 font-bold hover:underline">
                Створити перший товар
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}