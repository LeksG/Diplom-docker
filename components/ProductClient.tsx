'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/WishlistButton';

// Інтерфейс
interface ProductProps {
  id: number;
  title: string;
  price: number;
  oldPrice?: number | null;
  description: string | null;
  imageUrl: string | null;
  images?: { url: string; color: string | null }[]; 
  stock: number;
  category: { name: string; slug: string };
  sizes: string[];
  colors: string[];
  availableSizes: string[];
  variants?: { size: string; color: string; stock: number }[];
}

interface RelatedProduct {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
  category: { slug: string };
}

const colorMap: Record<string, string> = {
  'чорний': '#000000', 'black': '#000000',
  'білий': '#ffffff', 'white': '#ffffff',
  'сірий': '#808080', 'grey': '#808080',
  'бежевий': '#f5f5dc', 'beige': '#f5f5dc',
  'синій': '#1e3a8a', 'blue': '#1e3a8a',
  'червоний': '#dc2626', 'red': '#dc2626',
  'зелений': '#16a34a', 'green': '#16a34a',
  'жовтий': '#fbbf24', 'yellow': '#fbbf24',
  'коричневий': '#5D4037', 'brown': '#5D4037',
};

// --- МОДАЛКА ---
const SizeChartModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl">✕</button>
        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase">Таблиця розмірів</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-900">
            <thead className="bg-gray-100 text-xs uppercase font-black text-slate-900 border-b">
              <tr><th className="px-4 py-3">Розмір</th><th className="px-4 py-3">Груди (см)</th><th className="px-4 py-3">Талія (см)</th><th className="px-4 py-3">Стегна (см)</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-slate-800">
              <tr><td className="px-4 py-3">XS</td><td className="px-4 py-3">82-86</td><td className="px-4 py-3">62-66</td><td className="px-4 py-3">88-92</td></tr>
              <tr><td className="px-4 py-3">S</td><td className="px-4 py-3">86-90</td><td className="px-4 py-3">66-70</td><td className="px-4 py-3">92-96</td></tr>
              <tr><td className="px-4 py-3">M</td><td className="px-4 py-3">90-94</td><td className="px-4 py-3">70-74</td><td className="px-4 py-3">96-100</td></tr>
              <tr><td className="px-4 py-3">L</td><td className="px-4 py-3">94-98</td><td className="px-4 py-3">74-78</td><td className="px-4 py-3">100-104</td></tr>
              <tr><td className="px-4 py-3">XL</td><td className="px-4 py-3">98-102</td><td className="px-4 py-3">78-82</td><td className="px-4 py-3">104-108</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- СЛАЙДЕР ---
const ImageSlider = ({ images, title, isOutOfStock, discountPercent }: { images: string[], title: string, isOutOfStock: boolean, discountPercent: number | null }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Скидаємо на 0 тільки якщо змінився набір картинок
  useEffect(() => {
    setCurrentSlide(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center text-gray-400 border border-gray-100">
        Фото відсутнє
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 group">
      <img 
        src={images[currentSlide]} 
        alt={`${title} - фото ${currentSlide + 1}`} 
        className={`w-full h-full object-cover transition duration-500 ${isOutOfStock ? 'grayscale opacity-75' : ''}`} 
      />

      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        {isOutOfStock && <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-widest">SOLD OUT</span>}
        {!isOutOfStock && discountPercent && <span className="bg-red-600 text-white px-3 py-1 text-xs font-black uppercase tracking-widest">-{discountPercent}%</span>}
      </div>

      {/* Стрілки показуємо, якщо фото більше одного */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={(e) => { e.preventDefault(); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all shadow-sm ${currentSlide === idx ? 'bg-slate-900 w-6' : 'bg-white/80 w-2 hover:bg-white'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---
export default function ProductClient({ product, relatedProducts = [] }: { product: ProductProps; relatedProducts?: RelatedProduct[] }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 3;
  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  // 👇 НОВА ЛОГІКА "ВІЧНОГО СЛАЙДЕРА"
  const productImages = useMemo(() => {
    const gallery = product.images || [];
    const mainImage = product.imageUrl ? [product.imageUrl] : [];

    // 1. Збираємо АБСОЛЮТНО ВСІ доступні фото в один список
    const allImages = [...mainImage, ...gallery.map(img => img.url)];
    // Видаляємо дублікати (якщо головне фото є і в галереї)
    const uniqueImages = [...new Set(allImages)];

    // 2. Якщо колір не обраний — показуємо все підряд
    if (!selectedColor) return uniqueImages;

    // 3. Якщо колір обраний — СОРТУЄМО, а не фільтруємо
    const normalizedColor = selectedColor.toLowerCase();
    
    // Знаходимо фото, які точно підходять кольору
    const specificImages = gallery
      .filter(img => img.color && img.color.toLowerCase() === normalizedColor)
      .map(img => img.url);

    // Знаходимо всі інші фото
    const otherImages = uniqueImages.filter(url => !specificImages.includes(url));

    // 4. ПОВЕРТАЄМО ВСЕ РАЗОМ: Спочатку потрібний колір, потім решта
    // Це гарантує, що слайдер ніколи не буде пустим (якщо є хоч 1 фото)
    return [...specificImages, ...otherImages];

  }, [product.images, product.imageUrl, selectedColor]);

  const currentAvailableSizes = useMemo(() => {
    if (!product.variants?.length) return product.availableSizes || [];
    if (selectedColor) {
        return product.variants
            .filter(v => v.color === selectedColor && v.stock > 0)
            .map(v => v.size);
    }
    return product.availableSizes || [];
  }, [selectedColor, product]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (product.sizes.length > 0 && !selectedSize) return alert('⚠️ Оберіть розмір!');
    if (product.colors.length > 0 && !selectedColor) return alert('⚠️ Оберіть колір!');

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.imageUrl,
      size: selectedSize || "", 
      color: selectedColor || "",
      quantity: 1
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-hidden">
        <Link href="/" className="hover:text-black shrink-0">Головна</Link> / 
        <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-black capitalize shrink-0">{product.category.name}</Link> / 
        <span className="text-black font-bold truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* ЛІВА ЧАСТИНА (СЛАЙДЕР) */}
        <div className="space-y-4 relative">
          <ImageSlider 
            images={productImages} 
            title={product.title} 
            isOutOfStock={isOutOfStock} 
            discountPercent={discountPercent} 
          />
          <div className="absolute top-4 right-4 z-30">
             <WishlistButton product={product} className="w-12 h-12 bg-white/90 backdrop-blur shadow-md hover:bg-white text-slate-900" />
          </div>
        </div>

        {/* ПРАВА ЧАСТИНА (ІНФО) */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 leading-tight">{product.title}</h1>
          <p className="text-gray-500 font-medium mb-4 uppercase tracking-wider text-sm">{product.category.name} Collection</p>
          
          <div className="mb-6">
             {isOutOfStock ? (
                 <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">❌ Розпродано</span>
             ) : (
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${isLowStock ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {isLowStock ? '⚠️ Закінчується' : '✅ В наявності'}
                 </span>
             )}
          </div>

          <div className="flex items-end gap-3 mb-8">
            <div className="text-3xl font-black text-blue-600">{product.price} ₴</div>
            {product.oldPrice && product.oldPrice > product.price && (
                <div className="text-xl font-bold text-gray-400 line-through decoration-gray-300 mb-1">{product.oldPrice} ₴</div>
            )}
          </div>

          <div className="h-px bg-gray-100 w-full mb-8"></div>

          {/* КОЛЬОРИ */}
          {product.colors?.length > 0 && (
            <div className="mb-8">
              <p className="font-bold text-slate-900 mb-3 text-sm uppercase">Колір: <span className="text-gray-500 font-normal capitalize">{selectedColor || 'Оберіть'}</span></p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((colorName) => {
                  const bgStyle = colorMap[colorName.toLowerCase()] || colorName;
                  const isWhite = bgStyle === '#ffffff' || colorName.toLowerCase() === 'white';
                  let isAvailableInColor = true;
                  if (product.variants?.length) {
                      isAvailableInColor = product.variants.some(v => v.color === colorName && v.stock > 0);
                  }

                  return (
                    <button key={colorName} onClick={() => isAvailableInColor && setSelectedColor(colorName)} disabled={!isAvailableInColor}
                      className={`w-10 h-10 rounded-full border-2 shadow-sm transition relative ${selectedColor === colorName ? 'border-slate-900 ring-2 ring-slate-100 scale-110' : 'border-gray-200 hover:scale-105'} ${!isAvailableInColor ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: bgStyle }} title={colorName}>
                      {isWhite && <span className="absolute inset-0 rounded-full border border-gray-200 opacity-50"></span>}
                      {!isAvailableInColor && <span className="absolute inset-0 flex items-center justify-center"><div className="w-[120%] h-[1.5px] bg-red-500 rotate-45"></div></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* РОЗМІРИ */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-slate-900 text-sm uppercase">Розмір {selectedColor && <span className="text-xs text-gray-400 normal-case ml-2">(для {selectedColor})</span>}</p>
                <button onClick={() => setIsSizeChartOpen(true)} className="text-xs text-blue-600 underline font-medium hover:text-blue-800">Таблиця розмірів</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => {
                  const isAvailable = currentAvailableSizes.includes(size);
                  return (
                    <button key={size} onClick={() => isAvailable && setSelectedSize(size)} disabled={!isAvailable}
                      className={`py-3 rounded-xl font-bold border-2 transition text-sm relative ${!isAvailable ? 'bg-gray-100 text-black opacity-50 cursor-not-allowed border-gray-200' : selectedSize === size ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-gray-200 text-slate-900 hover:border-slate-900 bg-white'}`}>
                      {size}
                      {!isAvailable && <span className="absolute w-full h-[1px] bg-red-500 top-1/2 left-0 -rotate-12 opacity-80"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* КНОПКИ */}
          <div className="flex gap-3 mb-12">
            <button onClick={handleAddToCart} disabled={isOutOfStock || (product.sizes.length > 0 && !selectedSize) || (product.colors.length > 0 && !selectedColor)}
              className={`flex-1 py-4 font-bold rounded-xl shadow-lg transition active:scale-[0.98] text-lg uppercase tracking-wide ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {isOutOfStock ? 'Товар закінчився' : (selectedSize && (product.colors.length === 0 || selectedColor)) ? 'Додати в кошик' : 'Оберіть параметри'}
            </button>
            <WishlistButton product={product} className="w-16 h-auto rounded-xl border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center" />
          </div>

          {/* ІНФОРМАЦІЯ */}
          <div className="space-y-8">
            <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Опис товару</h3>
                <div className="text-gray-600 leading-relaxed text-sm space-y-2">
                    {product.description || "Опис товару відсутній."}
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-9V3.125C14.25 1.662 12.636 1 11 1h-1v8.375c0 .621.504 1.125 1.125 1.125H16.5Z" />
                    </svg>
                    Доставка та Оплата
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200">
                    <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">НП</div>
                            <div><p className="font-bold text-slate-900">Нова Пошта</p><p className="text-gray-500 text-xs">У відділення / Поштомат</p></div>
                        </div>
                        <p className="font-bold text-slate-900">від 80 ₴</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-sm">УП</div>
                            <div><p className="font-bold text-slate-900">Укрпошта</p><p className="text-gray-500 text-xs">Стандарт</p></div>
                        </div>
                        <p className="font-bold text-slate-900">від 45 ₴</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* СЕКЦІЯ ПОДІБНИХ ТОВАРІВ */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase text-center">Вам може сподобатися</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                  <Link href={`/product/${item.id}`} key={item.id} className="group block">
                      <div className="bg-gray-100 aspect-[3/4] rounded-xl mb-3 overflow-hidden relative border border-gray-200">
                          {item.imageUrl ? (
                             <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
                             />
                          ) : (
                             <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Photo</div>
                          )}
                          
                          <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur py-2 text-center text-xs font-bold translate-y-full group-hover:translate-y-0 transition-transform">
                              ПЕРЕГЛЯНУТИ
                          </div>
                      </div>
                      
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition truncate">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1 font-bold">
                        {item.price} ₴
                      </p>
                  </Link>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}