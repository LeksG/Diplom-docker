import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO HEADER */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Обмін та Повернення
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        
        {/* 2. ГОЛОВНІ УМОВИ (КАРТКИ) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
              📅
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">14 Днів</h3>
            <p className="text-sm text-gray-500">
              Повернення можливе протягом 14 днів з моменту отримання посилки.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
              🏷️
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Товарний вигляд</h3>
            <p className="text-sm text-gray-500">
              Річ має бути новою: збережені всі бірки, ярлики, упаковка, відсутні сліди носіння.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
              💳
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Повернення коштів</h3>
            <p className="text-sm text-gray-500">
              Гроші повертаються на картку протягом 3-7 робочих днів після отримання нами товару.
            </p>
          </div>
        </div>

        {/* 3. ЯК ОФОРМИТИ ПОВЕРНЕННЯ (КРОКИ) */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-8 border border-gray-200">
          <h2 className="text-2xl font-black text-slate-900 uppercase mb-8 text-center md:text-left">Процедура повернення</h2>
          
          <div className="space-y-8">
            {/* Крок 1 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Повідомте нас</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Зв'яжіться з менеджером у Telegram або за телефоном, щоб попередити про повернення. Вкажіть номер замовлення та причину.
                </p>
              </div>
            </div>

            {/* Крок 2 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Заповніть бланк</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  У посилці був бланк на повернення. Заповніть його (ПІБ, номер картки для повернення коштів). Якщо бланку немає — напишіть ці дані на аркуші паперу і вкладіть у посилку.
                </p>
              </div>
            </div>

            {/* Крок 3 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Надішліть товар</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Надішліть посилку <b>Новою Поштою</b> за адресою, вказаною нижче. 
                </p>
                <div className="bg-gray-100 p-4 rounded-xl text-sm border border-gray-200">
                  <p className="font-bold text-slate-900 mb-1">🏠 Адреса для повернення:</p>
                  <p>м. Київ, Відділення НП №150</p>
                  <p>Отримувач: ФОП Прізвище І.Б.</p>
                  <p>Телефон: +380 99 999 99 99</p>
                </div>
                <p className="text-xs text-red-500 mt-2 font-medium">
                  ⚠️ Важливо: Доставку оплачує покупець. Посилки, відправлені за рахунок отримувача або з післяплатою, не будуть забрані.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ТОВАРИ, ЩО НЕ ПІДЛЯГАЮТЬ ПОВЕРНЕННЮ */}
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h2 className="text-xl font-black text-red-700 uppercase">Увага! Товари, що не підлягають поверненню</h2>
          </div>
          <p className="text-red-900/80 text-sm mb-4">
            Згідно з Постановою КМУ від 19 березня 1994 р. № 172, наступні товари належної якості не підлягають обміну або поверненню:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-bold text-red-800">
            <li className="flex items-center gap-2">❌ Спідня білизна</li>
            <li className="flex items-center gap-2">❌ Шкарпетки та панчішні вироби</li>
            <li className="flex items-center gap-2">❌ Купальники та плавки</li>
            <li className="flex items-center gap-2">❌ Рукавички</li>
          </ul>
        </div>

        {/* 5. КОНТАКТИ ПІДТРИМКИ */}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Виникли питання щодо повернення?</p>
          <Link href="/about" className="text-blue-600 font-bold hover:underline text-lg">
            Зв'язатися з підтримкою
          </Link>
        </div>

      </div>
    </main>
  );
}