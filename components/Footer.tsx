import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-[1920px] mx-auto px-6 py-12">
        
        {/* Сітка колонок */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* КОЛОНКА 1: ЛОГО І ОПИС */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white">
              FIRMOVUY
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Твій надійний магазин стильного одягу. Ми пропонуємо тільки найкращу якість та актуальні моделі для твого гардеробу.
            </p>
            {/* Соцмережі */}
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition duration-300">
                {/* Instagram Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition duration-300">
                {/* Telegram Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </a>
            </div>
          </div>

          {/* КОЛОНКА 2: КАТАЛОГ */}
          <div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-wide">Каталог</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/catalog?gender=men" className="hover:text-white transition">Чоловікам</Link></li>
              <li><Link href="/catalog?gender=women" className="hover:text-white transition">Жінкам</Link></li>
              <li><Link href="/catalog?sort=newest" className="hover:text-white transition">Новинки</Link></li>
              <li><Link href="/catalog?sort=sale" className="text-red-400 hover:text-red-300 transition">Розпродаж</Link></li>
            </ul>
          </div>

          {/* КОЛОНКА 3: ІНФОРМАЦІЯ */}
          <div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-wide">Клієнтам</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white transition">Про нас</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition">Доставка та оплата</Link></li>
              <li><Link href="/returns" className="hover:text-white transition">Повернення товару</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Контакти</Link></li>
            </ul>
          </div>

          {/* КОЛОНКА 4: КОНТАКТИ */}
          <div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-wide">Зв'яжіться з нами</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-white font-medium">+380 (99) 922-91-30</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href="mailto:info@firmovuy.com" className="hover:text-white transition">info@firmovuy.com</a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Пн-Нд: 10:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* НИЖНЯ СМУЖКА */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FIRMOVUY. Всі права захищено.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Політика конфіденційності</Link>
            <Link href="/terms" className="hover:text-white transition">Публічна оферта</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}