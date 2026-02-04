'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { searchCities, getWarehouses } from '@/lib/novaposhta';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Стан вибору
  const [shippingMethod, setShippingMethod] = useState('NOVA'); // 'NOVA' | 'UKR'
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Стан форми (універсальний)
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    // Поля для НП
    city: '', 
    department: '',
    // Поля для Укрпошти
    ukrRegion: '',
    ukrIndex: '',
    ukrAddress: ''
  });

  // === ЛОГІКА НОВОЇ ПОШТИ ===
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  useEffect(() => {
    if (shippingMethod === 'NOVA' && cityQuery.length >= 2) {
      const timer = setTimeout(async () => {
        const results = await searchCities(cityQuery);
        setCities(results);
        setIsCityDropdownOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCities([]);
      setIsCityDropdownOpen(false);
    }
  }, [cityQuery, shippingMethod]);

  const selectCity = async (city: any) => {
    setCityQuery(city.name);
    setForm({ ...form, city: city.name, department: '' });
    setIsCityDropdownOpen(false);
    const whs = await getWarehouses(city.deliveryCity);
    setWarehouses(whs);
  };

  // === ВІДПРАВКА ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let userEmail = '';
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) userEmail = JSON.parse(userStr).email || '';
    }

    // 1. Формуємо красиву адресу в залежності від пошти
    let fullAddress = '';
    
    if (shippingMethod === 'NOVA') {
      // Для Нової Пошти: Місто + Відділення
      fullAddress = `${form.city}, ${form.department}`;
    } else {
      // Для Укрпошти: Індекс + Область/Місто + Вулиця
      fullAddress = `Індекс: ${form.ukrIndex}, ${form.ukrRegion}, ${form.ukrAddress} (Укрпошта)`;
    }

    try {
      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: fullAddress, // <--- Записуємо сформовану адресу
          customerEmail: userEmail,
          shippingMethod,
          paymentMethod,
          cartItems: items,
          totalPrice: cartTotal
        }),
      });

      if (res.ok) {
        clearCart();
        alert('✅ Замовлення успішно оформлено!');
        router.push('/profile');
      } else {
        alert('Помилка при оформленні');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return <div className="p-20 text-center font-bold text-gray-500">Кошик порожній</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ФОРМА */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Оформлення</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Контакти */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">1. Контакти</p>
              <input required type="text" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100" placeholder="ПІБ"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="tel" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100" placeholder="Телефон"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>

            {/* Доставка */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">2. Доставка</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={() => setShippingMethod('NOVA')}
                  className={`p-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center justify-center gap-1 transition ${shippingMethod === 'NOVA' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-500'}`}>
                  <span>🔴</span> Нова Пошта
                </button>
                <button type="button" onClick={() => setShippingMethod('UKR')}
                  className={`p-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center justify-center gap-1 transition ${shippingMethod === 'UKR' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-500'}`}>
                  <span>🟡</span> Укрпошта
                </button>
              </div>

              {/* === УМОВНИЙ РЕНДЕРИНГ ПОЛІВ === */}
              
              {shippingMethod === 'NOVA' ? (
                // ПОЛЯ ДЛЯ НОВОЇ ПОШТИ
                <div className="space-y-3 animate-fade-in-up">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Місто</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border rounded-xl outline-none focus:border-red-400 transition" 
                      placeholder="Введіть назву міста..."
                      value={cityQuery}
                      onChange={e => {
                        setCityQuery(e.target.value);
                        setForm({...form, city: e.target.value});
                      }}
                    />
                    {/* Список міст */}
                    {isCityDropdownOpen && cities.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border rounded-xl mt-1 shadow-xl max-h-60 overflow-y-auto">
                        {cities.map((city: any, idx) => (
                          <li key={idx} onClick={() => selectCity(city)} 
                              className="p-3 hover:bg-red-50 cursor-pointer text-sm border-b last:border-0">
                            {city.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Відділення</label>
                    <select 
                      required 
                      className="w-full p-3 border rounded-xl appearance-none bg-white outline-none focus:border-red-400 transition"
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      disabled={warehouses.length === 0}
                    >
                      <option value="">{warehouses.length > 0 ? 'Оберіть зі списку' : 'Спочатку оберіть місто'}</option>
                      {warehouses.map((wh, idx) => (
                        <option key={idx} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                // ПОЛЯ ДЛЯ УКРПОШТИ (Ручне введення)
                <div className="space-y-3 animate-fade-in-up">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Індекс</label>
                       <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:border-yellow-400" placeholder="01001"
                         value={form.ukrIndex} onChange={e => setForm({...form, ukrIndex: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Область / Місто</label>
                       <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:border-yellow-400" placeholder="Київська обл, м. Київ"
                         value={form.ukrRegion} onChange={e => setForm({...form, ukrRegion: e.target.value})} />
                    </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Повна адреса</label>
                     <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:border-yellow-400" placeholder="вул. Хрещатик, буд. 1, кв. 10"
                       value={form.ukrAddress} onChange={e => setForm({...form, ukrAddress: e.target.value})} />
                  </div>
                  <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                    ⚠️ Для Укрпошти важливо правильно вказати індекс для швидкої доставки.
                  </p>
                </div>
              )}
            </div>

            {/* Оплата */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">3. Оплата</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-slate-900 bg-gray-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 accent-slate-900" 
                    checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <div>
                    <p className="font-bold text-slate-900">При отриманні</p>
                    <p className="text-xs text-gray-500">Накладений платіж (+20 грн комісія пошти)</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'CARD' ? 'border-slate-900 bg-gray-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 accent-slate-900" 
                    checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                  <div>
                    <p className="font-bold text-slate-900">Оплата карткою Online</p>
                    <p className="text-xs text-gray-500">Без комісії</p>
                  </div>
                </label>
              </div>
            </div>
            
            <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:opacity-70">
              {loading ? 'Обробка...' : `ПІДТВЕРДИТИ ЗАМОВЛЕННЯ (${cartTotal} ₴)`}
            </button>
          </form>
        </div>

        {/* ПРАВА ЧАСТИНА (ТОВАРИ) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100">
           <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs">Ваш кошик</h3>
           <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{item.title}</p>
                  <p className="text-xs text-gray-500">x{item.quantity} | {item.size}</p>
                  <p className="font-bold text-blue-600">{item.price} ₴</p>
                </div>
              </div>
            ))}
            
            <div className="h-px bg-gray-100 my-4"></div>
            
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Товари:</span>
              <span>{cartTotal} ₴</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Доставка:</span>
              <span>за тарифами перевізника</span>
            </div>
            
            <div className="flex justify-between font-black text-xl pt-4 text-slate-900 border-t border-gray-100 mt-2">
              <span>До сплати:</span>
              <span>{cartTotal} ₴</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}