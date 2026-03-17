'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { searchCities, getWarehouses } from '@/lib/novaposhta';
import { OrderService } from '@/services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Стан вибору
  const [shippingMethod, setShippingMethod] = useState('NOVA'); // 'NOVA' | 'UKR'
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Стан форми
  const [form, setForm] = useState({ 
    lastName: '',
    firstName: '',
    middleName: '', 
    phone: '+380', 
    email: '', // ДОДАНО
    city: '', 
    department: '',
    ukrRegion: '',
    ukrIndex: '',
    ukrAddress: ''
  });

  // Автозаповнення email для залогінених користувачів
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.email) setForm(prev => ({ ...prev, email: user.email }));
      }
    }
  }, []);

  // ЛОГІКА НОВОЇ ПОШТИ 
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^\d+]/g, ''); 
    if (!val.startsWith('+380')) val = '+380';
    if (val.length > 13) val = val.slice(0, 13);
    setForm({ ...form, phone: val });
  };

  // ВАЛІДАЦІЯ
  const getValidationError = () => {
    if (!form.lastName.trim()) return "Вкажіть прізвище";
    if (!form.firstName.trim()) return "Вкажіть ім'я";
    if (!form.email.trim() || !form.email.includes('@')) return "Вкажіть коректний Email"; // ДОДАНО
    if (form.phone.length < 13) return "Введіть повний номер телефону";
    
    if (shippingMethod === 'NOVA') {
      if (!form.city) return "Оберіть місто зі списку";
      if (!form.department) return "Оберіть відділення НП";
    } else {
      if (!form.ukrIndex.trim()) return "Вкажіть індекс Укрпошти";
      if (!form.ukrRegion.trim()) return "Вкажіть область/місто";
      if (!form.ukrAddress.trim()) return "Вкажіть повну адресу";
    }
    
    return null; 
  };

  const validationError = getValidationError();
  const isValid = !validationError;

  // ВІДПРАВКА ТА ОПЛАТА 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return; 
    setLoading(true);

    const fullName = `${form.lastName} ${form.firstName} ${form.middleName}`.trim();

    let fullAddress = '';
    if (shippingMethod === 'NOVA') {
      fullAddress = `${form.city}, ${form.department}`;
    } else {
      fullAddress = `Індекс: ${form.ukrIndex}, ${form.ukrRegion}, ${form.ukrAddress} (Укрпошта)`;
    }

    try {
      // 1. Створюємо замовлення
      await OrderService.createOrder({
        customerName: fullName,
        customerPhone: form.phone,
        customerAddress: fullAddress,
        customerEmail: form.email, // Використовуємо email з форми
        shippingMethod,
        paymentMethod,
        cartItems: items,
        totalPrice: cartTotal
      });

      // 2. РОЗГАЛУЖЕННЯ
      if (paymentMethod === 'COD') {
        clearCart();
        alert('✅ Замовлення успішно оформлено!');
        router.push('/profile?tab=orders');
      } else {
        const stripeData = await OrderService.createCheckoutSession({
          items, 
          email: form.email 
        });

        if (stripeData.url) {
          clearCart(); 
          window.location.href = stripeData.url;
        } else {
          alert('Помилка з\'єднання з платіжною системою');
        }
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Щось пішло не так при оформленні замовлення');
    } finally {
      if (paymentMethod === 'COD') {
        setLoading(false);
      }
    }
  };

  if (items.length === 0) return <div className="p-20 text-center font-bold text-gray-500">Кошик порожній</div>;

  const inputStyles = "w-full p-3 border rounded-xl bg-gray-50 focus:bg-white text-slate-900 font-medium transition outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400";

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ФОРМА */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Оформлення</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">1. Контакти</p>
              
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" className={inputStyles} placeholder="Прізвище"
                  value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                <input required type="text" className={inputStyles} placeholder="Ім'я"
                  value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
              </div>
              
              <input type="text" className={inputStyles} placeholder="По батькові (необов'язково)"
                value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} />
              
              {/* НОВЕ ПОЛЕ EMAIL */}
              <input required type="email" className={inputStyles} placeholder="Email (для відстеження)"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />

              <input required type="tel" className={inputStyles} placeholder="+380XXXXXXXXX"
                value={form.phone} onChange={handlePhoneChange} />
            </div>

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

              {shippingMethod === 'NOVA' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Місто</label>
                    <input 
                      type="text" 
                      className={inputStyles} 
                      placeholder="Введіть назву міста..."
                      value={cityQuery}
                      onChange={e => {
                        setCityQuery(e.target.value);
                        setForm({...form, city: e.target.value, department: ''});
                      }}
                    />
                    {isCityDropdownOpen && cities.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl max-h-60 overflow-y-auto text-slate-900">
                        {cities.map((city: any, idx) => (
                          <li key={idx} onClick={() => selectCity(city)} 
                              className="p-3 hover:bg-red-50 cursor-pointer text-sm font-medium border-b last:border-0">
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
                      className={`${inputStyles} appearance-none cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      disabled={warehouses.length === 0}
                    >
                      <option value="" disabled>{warehouses.length > 0 ? 'Оберіть зі списку' : 'Спочатку оберіть місто'}</option>
                      {warehouses.map((wh, idx) => (
                        <option key={idx} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Індекс</label>
                        <input required type="text" className={inputStyles} placeholder="01001"
                          value={form.ukrIndex} onChange={e => setForm({...form, ukrIndex: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Область / Місто</label>
                        <input required type="text" className={inputStyles} placeholder="Київська обл, м. Київ"
                          value={form.ukrRegion} onChange={e => setForm({...form, ukrRegion: e.target.value})} />
                    </div>
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Повна адреса</label>
                      <input required type="text" className={inputStyles} placeholder="вул. Хрещатик, буд. 1, кв. 10"
                        value={form.ukrAddress} onChange={e => setForm({...form, ukrAddress: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">3. Оплата</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-slate-900 bg-gray-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 accent-slate-900" 
                    checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <div>
                    <p className="font-bold text-slate-900">При отриманні</p>
                    <p className="text-xs text-gray-500">Накладений платіж (+20 грн комісія)</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'CARD' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 accent-indigo-600" 
                    checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                  <div className="flex justify-between w-full items-center pr-2">
                    <div>
                      <p className="font-bold text-slate-900">Оплата карткою Online</p>
                      <p className="text-xs text-gray-500">Stripe (Visa / MasterCard / GPay)</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <button 
              disabled={loading || !isValid} 
              className={`w-full py-4 text-white font-bold rounded-xl mt-4 transition shadow-lg 
                ${(!isValid || loading) 
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : (paymentMethod === 'CARD' ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' : 'bg-slate-900 hover:bg-slate-800 active:scale-95')
                }`}
            >
              {loading 
                ? 'Обробка...' 
                : (!isValid 
                    ? `ЗАПОВНІТЬ ДАНІ: ${validationError?.toUpperCase()}` 
                    : (paymentMethod === 'CARD' 
                        ? `ОПЛАТИТИ ЗАМОВЛЕННЯ (${cartTotal} ₴)` 
                        : `ПІДТВЕРДИТИ ЗАМОВЛЕННЯ (${cartTotal} ₴)`
                      )
                  )
              }
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