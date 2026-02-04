import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
        {/* Декоративний фон */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
            FIRMOVUY — це стиль, <span className="text-blue-500">який ти обираєш!</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Ми не просто продаємо одяг. Ми допомагаємо тобі виразити себе через якісні брендові речі, які дарують впевненість.
          </p>
        </div>
      </section>

      {/* 2. НАША ІСТОРІЯ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Наша місія</h2>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
            <p className="text-gray-600 leading-relaxed text-lg">
              Проєкт <b>FIRMOVUY</b> був створений з простою метою: зробити оригінальний брендовий одяг доступним та зручним для замовлення в Україні.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Ми втомилися від підробок, довгих очікувань та поганого сервісу. Тому ми створили простір, де кожен клієнт — це наш друг, а кожна річ — це гарантія якості. Ми ретельно відбираємо колекції, слідкуємо за трендами та дбаємо про те, щоб ви отримали своє замовлення максимально швидко.
            </p>
            
            <div className="flex gap-8 pt-4">
              <div>
                <span className="block text-4xl font-black text-slate-900">5+</span>
                <span className="text-sm text-gray-500 font-bold uppercase">Років на ринку</span>
              </div>
              <div>
                <span className="block text-4xl font-black text-slate-900">10k+</span>
                <span className="text-sm text-gray-500 font-bold uppercase">Задоволених клієнтів</span>
              </div>
            </div>
          </div>
          
          {/* Імітація фото (замініть на реальне фото команди або складу) */}
          <div className="relative aspect-square md:aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-xl group">
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
             {/* Тут має бути ваше фото */}
             <img 
               src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop" 
               alt="Team work" 
               className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
             />
             <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-bold text-lg">Наша команда</p>
                <p className="text-sm opacity-80">Працюємо для вас 24/7</p>
             </div>
          </div>
        </div>
      </section>

      {/* 3. ЧОМУ ОБИРАЮТЬ НАС (ПЕРЕВАГИ) */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 uppercase mb-16">Чому обирають нас?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition hover:-translate-y-1 duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 12 2s10 4.477 10 10Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Оригінал</h3>
              <p className="text-gray-500 leading-relaxed">
                Ми співпрацюємо тільки з офіційними постачальниками. Жодних реплік чи копій. Тільки автентичні бренди.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition hover:-translate-y-1 duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-9V3.125C14.25 1.662 12.636 1 11 1h-1v8.375c0 .621.504 1.125 1.125 1.125H16.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Швидка доставка</h3>
              <p className="text-gray-500 leading-relaxed">
                Відправка в день замовлення. Ми знаємо, як сильно ви чекаєте на обновку, тому не змушуємо чекати.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition hover:-translate-y-1 duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Любов до клієнтів</h3>
              <p className="text-gray-500 leading-relaxed">
                Потрібна консультація? Допомога з розміром? Ми завжди на зв'язку. Обмін та повернення без зайвих запитань.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA (Call to Action) */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-6">Готові оновити гардероб?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
              Перегляньте наш каталог та знайдіть річ, яка стане вашою улюбленою вже завтра.
            </p>
            <Link href="/catalog" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30">
              Перейти до каталогу
            </Link>
          </div>
          
          {/* Декор */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>

    </main>
  );
}