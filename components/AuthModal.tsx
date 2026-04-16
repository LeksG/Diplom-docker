'use client';

import { useState } from 'react';
import { AuthService } from '@/services/api';
import Cookies from 'js-cookie';
import { RegisterSchema } from '@/lib/validation'; 

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: '', // Це інпут у формі, він мапиться в firstName
    email: '',
    password: '',
    confirmPassword: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!isLogin) {
      // 1. ВАЛІДАЦІЯ: тепер тут firstName
      const validationResult = RegisterSchema.safeParse({
        firstName: formData.name, 
        email: formData.email,
        password: formData.password,
      });

      if (!validationResult.success) {
        setError(validationResult.error.issues[0].message);
        setLoading(false);
        return; 
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Паролі не співпадають. Спробуйте ще раз.');
        setLoading(false);
        return;
      }
    }

    try {
      // 2. ВІДПРАВКА НА СЕРВЕР: тепер тут firstName
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.name, 
      };

      const data = isLogin 
        ? await AuthService.login(payload)
        : await AuthService.register(payload);

      console.log("ВІДПОВІДЬ:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (isLogin) {
        if (data.token) {
          Cookies.set('token', data.token, { expires: 7, path: '/' });
          localStorage.setItem('token', data.token);
        }

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userName', data.user.firstName || 'Користувач');
          window.dispatchEvent(new Event('user-auth-change'));
        }
       
        window.location.reload(); 
      } else {
        setSuccessMsg('Акаунт успішно створено! Тепер увійдіть.'); 
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setFormData({ ...formData, password: '', confirmPassword: '' }); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-4 border border-red-100">
               {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center mb-4 border border-green-100 font-medium">
               {successMsg}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
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

            <div className="group bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition flex items-center justify-between">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Пароль" 
                required
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder-gray-400"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-400 hover:text-slate-900 focus:outline-none transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            {!isLogin && (
              <div className="group bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition flex items-center justify-between">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Підтвердіть пароль" 
                  required
                  className="w-full bg-transparent focus:outline-none text-slate-900 placeholder-gray-400"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2 text-gray-400 hover:text-slate-900 focus:outline-none transition"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg active:scale-[0.98]"
            >
              {loading ? "Зачекайте..." : (isLogin ? 'Увійти в акаунт' : 'Зареєструватися')}
            </button>
          </form>

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