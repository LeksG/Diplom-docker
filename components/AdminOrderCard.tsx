'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService } from '@/services/api';

interface OrderProps {
  order: any; 
}

// Список можливих статусів
const STATUSES = [
  { value: 'NEW', label: '🔵 Нове замовлення' },
  { value: 'PROCESSING', label: '🟡 Обробляється' },
  { value: 'SHIPPED', label: '🚚 В дорозі' },
  { value: 'ARRIVED', label: '📍 Прибуло у відділення' },
  { value: 'COMPLETED', label: '✅ Виконано (Забрали)' },
  { value: 'CANCELED', label: '❌ Скасовано' },
];

export default function AdminOrderCard({ order }: OrderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Дані форми (для редагування)
  const [formData, setFormData] = useState({
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
  });

  // Функція оновлення
  const handleUpdate = async () => {
    setLoading(true);
    try {
    await OrderService.update(order.id, formData);

        setIsEditing(false);
        router.refresh(); 
        alert('Замовлення оновлено!');
      
    } catch (e) {
      alert('Помилка оновлення');
    } finally {
      setLoading(false);
    }
  };

  // Функція видалення
  const handleDelete = async () => {
    if (!confirm('Видалити це замовлення назавжди?')) return;
    
    try {
      await OrderService.delete(order.id);
      
      router.refresh();
    } catch (e) {
      alert('Помилка видалення');
    }
  };

  // Колір статусу для краси
  const getStatusColor = (status: string) => {
    if (status === 'NEW') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'COMPLETED') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'CANCELED') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition hover:shadow-md">
      
      {/* ШАПКА ЗАМОВЛЕННЯ */}
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-bold text-slate-900 text-lg mr-3">#{order.id}</span>
          <span className="text-gray-500 text-sm">
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Вибір статусу (Dropdown) */}
        <div className="flex items-center gap-3">
          <select
            value={formData.status}
            onChange={(e) => {
              setFormData({...formData, status: e.target.value});
              
            }}
            disabled={!isEditing}
            className={`px-3 py-2 rounded-lg text-sm font-bold border outline-none appearance-none cursor-pointer ${getStatusColor(formData.status)} ${!isEditing && 'opacity-100'}`}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ТІЛО ЗАМОВЛЕННЯ */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ЛІВА КОЛОНКА: Дані клієнта */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase mb-4">Дані клієнта</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-900 block">Ім'я</label>
              {isEditing ? (
                <input 
                  type="text" className="w-full text-slate-900 border p-2 rounded" 
                  value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} 
                />
              ) : (
                <p className="font-bold text-slate-900">{order.customerName}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-900 block">Телефон</label>
              {isEditing ? (
                <input 
                  type="text" className="w-full text-slate-900 border p-2 rounded" 
                  value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} 
                />
              ) : (
                <p className="font-bold text-slate-900">{order.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-900 block">Адреса доставки</label>
              {isEditing ? (
                <input 
                  type="text" className="w-full text-slate-900 border p-2 rounded" 
                  value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} 
                />
              ) : (
                <p className="font-bold text-slate-900">{order.customerAddress}</p>
              )}
            </div>
            
            {order.customerEmail && (
               <div>
                  <label className="text-xs text-slate-900 block">Email (Акаунт)</label>
                  <p className="font-bold text-slate-900">{order.customerEmail}</p>
               </div>
            )}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА: Товари */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase mb-4">Товари</h3>
          <ul className="space-y-3 text-slate-900 bg-gray-50 p-4 rounded-xl">
            {order.items.map((item: any) => (
              <li key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-sm">{item.productTitle}</p>
                  <p className="text-xs text-slate-900">{item.size} {item.color ? `| ${item.color}` : ''} (x{item.quantity})</p>
                </div>
                <p className="font-bold">{item.price} ₴</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <span className="text-slate-900 font-bold text-lg">Сума:</span>
            <span className="font-black text-2xl text-blue-600">{order.totalPrice} ₴</span>
          </div>
        </div>

      </div>

      {/* ПІДВАЛ: Кнопки дій */}
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
            >
              Скасувати
            </button>
            <button 
              onClick={handleUpdate} 
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg"
            >
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleDelete} 
              className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg transition"
            >
              Видалити
            </button>
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition shadow-lg"
            >
              Редагувати
            </button>
          </>
        )}
      </div>

    </div>
  );
}