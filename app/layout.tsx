import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartModal from '@/components/CartModal';
import TopProgressBar from '@/components/TopProgressBar';
import { Suspense } from 'react'; 

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
        
        <CartProvider>
          <WishlistProvider>
            
            <TopProgressBar />

            {/* 2. Обгортаємо Header у Suspense */}
            <Suspense fallback={<div className="h-20" />}>
              <Header />
              
            </Suspense>

            <CartModal /> 
            
            {children}

            <Footer />

          </WishlistProvider>
        </CartProvider>
        
      </body>
    </html>
  );
}