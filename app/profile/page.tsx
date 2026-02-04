'use client';

import { useState, useEffect, Suspense } from 'react'; // 👈 1. Додали Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext'; 

// === ТИПИ ДАНИХ ===
interface OrderItem {
  id: number;
  productTitle: string;
  quantity: number;
  price: number;
  size: string;
  color?: string;
}

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  customerAddress: string;
  customerPhone: string;
  shippingMethod: string;
  paymentMethod: string;
  items: OrderItem[];
}

// 👇 2. Це тепер ВНУТРІШНІЙ компонент (прибрали export default)
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { items: wishlistItems, removeFromWishlist } = useWishlist();

  // Стан інтерфейсу
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'favorites'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Дані
  const [orders, setOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState({
    email: '',
    fullName: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    createdAt: ''
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites') {
      setActiveTab('favorites');
    } else if (tab === 'orders') {
      setActiveTab('orders');
    }
  }, [searchParams]);
  
  // 1. ЗАВАНТАЖЕННЯ ДАНИХ
  useEffect(() => {
    const initProfile = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setIsLoading(true);

      try {
        const res = await fetch('/api/user/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: parsedUser.email }),
        });

        if (res.ok) {
          const freshData = await res.json();
          setUserData({
            email: freshData.email,
            fullName: freshData.fullName || parsedUser.name || '',
            phone: freshData.phone || '',
            country: freshData.country || '',
            city: freshData.city || '',
            address: freshData.address || '',
            createdAt: freshData.createdAt || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [router]);

  // 2. ЗАВАНТАЖЕННЯ ЗАМОВЛЕНЬ
  useEffect(() => {
    if (activeTab === 'orders' && userData.email) {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/order/my-orders', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email }),
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchOrders();
    }
  }, [activeTab, userData.email]);

  // 3. ЗБЕРЕЖЕННЯ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const updated = await res.json();
        const localData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...localData, name: updated.fullName }));
        
        setNotification({ type: 'success', message: 'Дані збережено успішно!' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Помилка збереження' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if(confirm('Вийти з акаунту?')) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'NEW': 'Нове', 'PROCESSING': 'Обробляється', 'SHIPPED': 'В дорозі',
      'ARRIVED': 'Прибуло', 'COMPLETED': 'Виконано', 'CANCELED': 'Скасовано'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'CANCELED') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'SHIPPED' || status === 'ARRIVED') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Завантаження профілю...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      {notification && (
        <div className={`fixed top-24 right-5 p-4 rounded-xl shadow-xl text-white font-bold z-50 animate-slide-in ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 uppercase tracking-tight">Особистий кабінет</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* === ЛІВИЙ САЙДБАР === */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24 border border-gray-100">
              <div className="p-8 flex flex-col items-center bg-slate-900 text-white">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold mb-4 border-4 border-slate-700">
                  {userData.fullName ? userData.fullName[0].toUpperCase() : '👤'}
                </div>
                <h3 className="font-bold text-center leading-tight">{userData.fullName || 'Гість'}</h3>
                <p className="text-sm text-gray-400 mt-1">{userData.email}</p>
              </div>
              
              <nav className="p-3 space-y-1">
                <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'info' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  👤 Особисті дані
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  📦 Мої замовлення
                </button>
                <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">❤️ Список бажань</div>
                  {wishlistItems.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistItems.length}</span>
                  )}
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-500 hover:bg-red-50">
                  🚪 Вийти
                </button>
              </nav>
            </div>
          </aside>

          {/* === ПРАВА ЧАСТИНА === */}
          <div className="flex-grow">
            
            {/* 1. РЕДАГУВАННЯ */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Особисті дані</h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ПІБ</label>
                    <input type="text" value={userData.fullName} onChange={(e) => setUserData({...userData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 transition" placeholder="Ваше ім'я" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Телефон</label>
                        <input type="text" value={userData.phone} onChange={(e) => setUserData({...userData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 transition" placeholder="+380..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                        <input type="text" value={userData.email} disabled className="w-full bg-gray-100 border border-gray-200 p-3 rounded-xl text-gray-400 cursor-not-allowed" />
                      </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Місто</label>
                    <input type="text" value={userData.city} onChange={(e) => setUserData({...userData, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 transition" placeholder="Київ" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Відділення / Адреса</label>
                    <input type="text" value={userData.address} onChange={(e) => setUserData({...userData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 transition" placeholder="Відділення №..." />
                  </div>
                  <button type="submit" disabled={isSaving} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:opacity-70">
                    {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. ІСТОРІЯ ЗАМОВЛЕНЬ */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-slate-900">Історія замовлень</h2>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xl text-slate-900">#{order.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 font-medium">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-400 uppercase font-bold">Сума до сплати</p>
                           <p className="text-2xl font-black text-blue-600">{order.totalPrice} ₴</p>
                        </div>
                      </div>
                      <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                           <p className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                             📍 Доставка
                             {order.shippingMethod === 'NOVA' ? (
                               <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">Нова Пошта</span>
                             ) : (
                               <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded font-bold uppercase tracking-wide">Укрпошта</span>
                             )}
                           </p>
                           <p className="text-slate-900 font-medium">{order.customerAddress}</p>
                           <p className="text-gray-500 mt-1">{order.customerPhone}</p>
                        </div>
                        <div>
                           <p className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                             💳 Оплата
                             <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                               {order.paymentMethod === 'CARD' ? 'Online' : 'При отриманні'}
                             </span>
                           </p>
                           <p className="text-slate-900 font-medium">
                             {order.paymentMethod === 'CARD' ? 'Оплата карткою' : 'Накладений платіж'}
                           </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                                 x{item.quantity}
                               </div>
                               <div>
                                 <p className="font-bold text-slate-900 text-sm">{item.productTitle}</p>
                                 <p className="text-xs text-gray-500 mt-0.5">Розмір: <span className="font-medium text-slate-700">{item.size}</span> {item.color && `| Колір: ${item.color}`}</p>
                               </div>
                            </div>
                            <p className="font-bold text-slate-700">{item.price} ₴</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-500 font-medium mb-6">Історія замовлень порожня</p>
                    <Link href="/catalog" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg">
                      Перейти до покупок
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. СПИСОК БАЖАНЬ (CUSTOM DESIGN) */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Список бажань ❤️</h2>
                
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                      
                      // 👇 ЗАМІСТЬ ProductCard ВИКОРИСТОВУЄМО СВІЙ HTML
                      <div key={product.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                        
                        {/* 1. ФОТО БЕЗ СЕРДЕЧКА */}
                        <Link href={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-gray-100">
                           {product.imageUrl ? (
                             <img 
                               src={product.imageUrl} 
                               alt={product.title} 
                               className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Без фото</div>
                           )}
                        </Link>

                        {/* 2. ІНФО + КНОПКА ВИДАЛИТИ */}
                        <div className="p-4">
                           <Link href={`/product/${product.id}`} className="block">
                             <h3 className="font-bold text-slate-900 text-sm mb-1 truncate hover:text-blue-600 transition">{product.title}</h3>
                           </Link>
                           
                           <div className="flex justify-between items-center mt-2">
                              <span className="font-black text-slate-900 text-lg">{product.price} ₴</span>
                              
                              {/* КНОПКА ВИДАЛИТИ */}
                              <button 
                                onClick={() => removeFromWishlist(product.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-500 transition"
                                title="Видалити зі списку"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                           </div>
                        </div>

                      </div>

                    ))}
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl text-center">
                      <div className="text-4xl mb-3">💔</div>
                      <p className="text-gray-500 mb-4">Ваш список бажань порожній</p>
                      <Link href="/catalog" className="text-blue-600 font-bold hover:underline">
                        Знайти щось цікаве
                      </Link>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

// 👇 4. ГОЛОВНИЙ КОМПОНЕНТ-ОБГОРТКА
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Завантаження...</div>}>
      <ProfileContent />
    </Suspense>
  );
}