'use client';

import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  // Стани для даних форми
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // <--- Новий стан для зеленого повідомлення

  if (!isOpen) return null;

  // Функція обробки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Помилка сервера');
      }

      // === ЛОГІКА УСПІХУ (БЕЗ ALERT) ===
      
      if (isLogin) {
        // Якщо це ВХІД:
        localStorage.setItem('user', JSON.stringify(data));
        window.location.reload(); // Оновлюємо сторінку (вікно закриється саме)
      } else {
        // Якщо це РЕЄСТРАЦІЯ:
        setSuccessMsg('Акаунт успішно створено! Тепер увійдіть.'); // Показуємо текст
        setIsLogin(true); // Перемикаємо на вкладку входу
        // Поля email та password залишаються заповненими, щоб користувачу було зручно
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Очищення повідомлень при перемиканні вкладок
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Кнопка закриття */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-2 uppercase tracking-tight">
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </h2>
          
          <p className="text-center text-gray-400 text-sm mb-6">
            {isLogin ? 'Раді бачити вас знову' : 'Приєднуйтесь до спільноти FRMV'}
          </p>

          {/* Блок помилок (Червоний) */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-4 border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* Блок успіху (Зелений) */}
          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center mb-4 border border-green-100 font-medium">
              ✅ {successMsg}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            
            {/* Поле Ім'я (Тільки для реєстрації) */}
            {!isLogin && (
              <div className="group bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition">
                <input 
                  type="text" 
                  placeholder="Ваше ім'я" 
                  required
                  className="w-full bg-transparent focus:outline-none text-slate-900 placeholder-gray-400"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            {/* Email */}
            <div className="group bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition">
              <input 
                type="email" 
                placeholder="Email адреса" 
                required
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Пароль */}
            <div className="group bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition">
              <input 
                type="password" 
                placeholder="Пароль" 
                required
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder-gray-400"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Кнопка */}
            <button 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Зачекайте...
                </span>
              ) : (isLogin ? 'Увійти в акаунт' : 'Зареєструватися')}
            </button>
          </form>

          {/* Перемикач */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? 'Ще немає акаунту? ' : 'Вже зареєстровані? '}
            <button 
              onClick={toggleMode}
              className="font-bold text-slate-900 hover:text-blue-600 transition"
            >
              {isLogin ? 'Створити зараз' : 'Увійти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}