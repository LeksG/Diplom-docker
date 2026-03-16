import Link from 'next/link';

export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. ЗАГОЛОВОК */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Доставка та Оплата
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        
        {/* 2. БЛОК ДОСТАВКИ */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-9V3.125C14.25 1.662 12.636 1 11 1h-1v8.375c0 .621.504 1.125 1.125 1.125H16.5Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Способи доставки</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Нова Пошта */}
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-red-200 hover:bg-red-50/30 transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">НП</div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">1-3 дні</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-red-600 transition">Нова Пошта</h3>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  У відділення
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  У поштомат
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Кур'єром до дверей
                </li>
              </ul>
              <p className="text-sm font-bold text-slate-900 pt-4 border-t border-dashed border-gray-200">
                Вартість: від 80 ₴
              </p>
            </div>

            {/* Укрпошта */}
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-yellow-200 hover:bg-yellow-50/30 transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-yellow-400 text-slate-900 rounded-lg flex items-center justify-center font-bold text-xs">УП</div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">3-7 днів</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-yellow-600 transition">Укрпошта</h3>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  У відділення (Стандарт)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  Експрес доставка
                </li>
              </ul>
              <p className="text-sm font-bold text-slate-900 pt-4 border-t border-dashed border-gray-200">
                Вартість: від 45 ₴
              </p>
            </div>
          </div>
        </div>

        {/* 3. БЛОК ОПЛАТИ */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Способи оплати</h2>
          </div>

          <div className="space-y-4">
            {/* Оплата на сайті */}
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 12 2s10 4.477 10 10Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Оплата карткою на сайті (Visa/Mastercard)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Безпечна оплата через WayForPay або Apple/Google Pay. Комісія 0%.
                </p>
              </div>
            </div>

            {/* Накладений платіж */}
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition">
              <div className="w-10 h-10 bg-white border-2 border-slate-900 text-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 5.25h18a.75.75 0 0 1 .75.75v.75m-3 12a15.75 15.75 0 0 1-15.75-3.75h15.75c.621 0 1.125-.504 1.125-1.125v-9c0-.621-.504-1.125-1.125-1.125h-.375M12 20.25a6 6 0 0 1-6-6v-3m6 3v6m3-3h.008v.008H15v-.008Zm0-2.25h.008v.008H15V15Zm0 2.25h2.25v2.25H15V17.25Zm0-2.25h2.25v2.25H15V15Zm-2.25-2.25h2.25v2.25H12.75v-2.25Zm-2.25 0h2.25v2.25H10.5v-2.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Накладений платіж (Оплата при отриманні)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Оплата готівкою або карткою у відділенні пошти після огляду товару.
                </p>
                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg inline-block">
                  ⚠️ <b>Увага:</b> Пошта стягує комісію за переказ коштів (20 ₴ + 2% від суми).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Питання? */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Залишилися питання?</p>
          <Link href="/contacts" className="text-blue-600 font-bold hover:underline">
            Зв'язатися з підтримкою
          </Link>
        </div>

      </div>
    </main>
  );
}