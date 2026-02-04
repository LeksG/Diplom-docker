'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number | null; // Нове поле
  stock: number;            // Нове поле
  category: { name: string } | null;
  imageUrl?: string;
  sizes: string[];          // Нове поле
  availableSizes: string[]; // Нове поле
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Завантажуємо товари (Новий API Endpoint)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Використовуємо новий загальний роут
      const response = await fetch('/api/products', { cache: 'no-store' });
      
      if (!response.ok) throw new Error('Помилка завантаження');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Функція видалення (Новий метод DELETE по ID)
  const handleDelete = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return;
    
    try {
      // Видаляємо через динамічний роут [id]
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Не вдалося видалити товар');
      }
    } catch (error) {
      alert('Помилка сервера при видаленні');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Шапка адмінки */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Адмін-панель</h1>
          
          <div className="flex gap-6">
            <Link href="/admin" className="text-xl font-bold text-slate-900 border-b-2 border-slate-900">Товари</Link>
            {/* Заготовка під замовлення */}
            <Link href="/admin/orders" className="text-xl font-bold text-gray-400 hover:text-slate-900 transition">Замовлення</Link>
          </div>
          
          <Link 
            href="/admin/add-product" // Переконайся, що шлях до форми створення правильний
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
          >
            <span>+</span> Додати товар
          </Link>
        </div>

        {/* Таблиця */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 w-16">ID</th>
                <th className="p-4 w-20">Фото</th>
                <th className="p-4">Інфо</th>
                <th className="p-4">Склад</th>
                <th className="p-4">Розміри</th>
                <th className="p-4">Ціна</th>
                <th className="p-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center text-gray-500">Завантаження...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition group">
                  
                  {/* ID */}
                  <td className="p-4 text-gray-400 text-xs font-mono">#{product.id}</td>
                  
                  {/* Фото */}
                  <td className="p-4">
                    <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="img" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">No img</div>
                      )}
                    </div>
                  </td>

                  {/* Назва та Категорія */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{product.title}</div>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {product.category?.name || 'Без категорії'}
                    </span>
                  </td>

                  {/* Склад (Stock) */}
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

                  {/* Розміри (Закреслюємо недоступні) */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {product.sizes.length > 0 ? product.sizes.map(size => {
                            // Перевіряємо, чи є розмір у списку доступних
                            const isAvailable = product.availableSizes.includes(size);
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
                  
                  {/* Ціна (Зі знижкою) */}
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
                  
                  {/* Дії */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Link 
  href={`/admin/product/${product.id}`} // Веде на сторінку редагування
    className="w-8 h-8 flex items-center justify-center bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 hover:text-yellow-800 transition"
   title="Редагувати"
>
  </Link>{/* Кнопка редагування (поки що заглушка) */}
                        {/* <Link href={`/admin/product/${product.id}`} className="...">✏️</Link> */}
                        
                        <button 
                        onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded hover:bg-red-100 hover:text-red-700 transition"
                        title="Видалити"
                        >
                        🗑️
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
              <Link href="/admin/add" className="text-blue-600 font-bold hover:underline">
                Створити перший товар
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}