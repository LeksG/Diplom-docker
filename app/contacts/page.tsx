'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContactService } from '@/services/api';

export default function ContactsPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

   try {
    await ContactService.sendFeedback(formData);
    setFormStatus('success');
    setFormData({ name: '', contactInfo: '', message: '' }); 
  } catch (error: any) {
    console.error('Помилка відправки:', error);
    setFormStatus('error');
    alert(error.message || 'Помилка при відправці повідомлення. Спробуйте пізніше.');
  }
};

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO HEADER */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Контакти
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* === ЛІВА КОЛОНКА: ІНФОРМАЦІЯ === */}
          <div className="space-y-6">
            
            {/* Картка контактів */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-black text-slate-900 uppercase mb-8">Наші дані</h2>
              
              <div className="space-y-8">
                {/* Телефон */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Телефон / Viber / Telegram</p>
                    <a href="tel:+380999999999" className="text-xl font-black text-slate-900 hover:text-blue-600 transition block">
                      +380 999 229 130
                    </a>
                    <p className="text-sm text-gray-400 mt-1">Пн-Нд: 10:00 - 20:00</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Електронна пошта</p>
                    <a href="mailto:support@firmovuy.ua" className="text-xl font-bold text-slate-900 hover:text-purple-600 transition">
                      support@firmovuy.ua
                    </a>
                    <p className="text-sm text-gray-400 mt-1">Для співпраці та пропозицій</p>
                  </div>
                </div>

                {/* Соцмережі */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-2">Ми в соцмережах</p>
                    <div className="flex gap-4">
                      <a href="#" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition">Instagram</a>
                      <a href="#" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-slate-900 hover:bg-blue-500 hover:text-white transition">Telegram</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === ПРАВА КОЛОНКА: ФОРМА === */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 h-fit">
            
            {formStatus === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Повідомлення надіслано!</h3>
                <p className="text-gray-500 mb-8 max-w-xs">Дякуємо. Ми зв'яжемося з вами найближчим часом.</p>
                <button onClick={() => setFormStatus('idle')} className="text-blue-600 font-bold hover:underline">
                  Надіслати ще одне
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">Напишіть нам</h2>
                  <p className="text-gray-500 text-sm">Заповніть форму, і ми відповімо протягом 30 хвилин.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ваше ім'я</label>
                    <input 
                      required 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition font-medium text-slate-900" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                    <input 
                      required 
                      type="text" 
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition font-medium text-slate-900" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Повідомлення</label>
                    <textarea 
                      required 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4} 
                      className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition font-medium text-slate-900 resize-none"
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={formStatus === 'loading'}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {formStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Відправка...
                    </>
                  ) : (
                    'Надіслати повідомлення'
                  )}
                </button>
                
                <p className="text-xs text-gray-400 text-center">
                  Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}