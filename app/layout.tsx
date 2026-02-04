import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext'; // <--- 1. Додали імпорт
import CartModal from '@/components/CartModal';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'FIRMOVUY | Streetwear Store',
  description: 'Магазин стильного одягу',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        
        {/* Обгортаємо весь сайт в Провайдер Кошика */}
        <CartProvider>
          {/* 👇 2. Обгортаємо в Провайдер Бажаного (всередині кошика) */}
          <WishlistProvider>
            
            <Header />
            <CartModal /> {/* Модальне вікно завжди тут, але сховане */}
            
            {children}

            <Footer />

          </WishlistProvider>
        </CartProvider>
        
      </body>
    </html>
  );
}