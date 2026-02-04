'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

// 👇 1. Define the Category interface
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface VariantItem {
  id: string; 
  size: string;
  color: string;
  stock: number;
}

interface ProductImageItem {
  url: string;
  color: string | null;
}

// 👇 2. Define Props interface
interface AdminProductFormProps {
  categories: Category[];
}

// 👇 3. Accept categories as a prop
export default function AdminProductForm({ categories }: AdminProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // === PRODUCT DATA ===
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // === UI LOGIC ===
  const [gender, setGender] = useState('men'); 
  const [type, setType] = useState('hoodies'); 

  // 👇 4. We use the prop 'categories' directly. No need for dbCategories state or useEffect fetch.
  
  // === VARIANTS (SKU) ===
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]); 

  // 5. Calculate current category ID based on the passed prop
  const targetSlug = `${gender}-${type}`;
  const foundCategory = categories.find(c => c.slug === targetSlug);

  // Lists
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['чорний', 'білий', 'сірий', 'бежевий', 'синій', 'червоний', 'зелений'];
  
  const COMMON_TYPES = [
    { value: 'hoodies', label: 'Худі та Світшоти' },
    { value: 'pants', label: 'Штани' },
    { value: 'tshirts', label: 'Футболки та Поло' },
    { value: 'suits', label: 'Спортивні костюми' },
    { value: 'shirts', label: 'Сорочки' },
    { value: 'jackets', label: 'Куртки' },
    { value: 'shorts', label: 'Шорти' },
    { value: 'coats', label: 'Пальто' },
    { value: 'sneakers', label: 'Взуття' },
  ];
  const WOMEN_ONLY_TYPES = [
    { value: 'dresses', label: 'Сукні' },
    { value: 'tops', label: 'Топи' },
    { value: 'shoes', label: 'Взуття' },
  ];
  const availableTypes = gender === 'women' ? [...COMMON_TYPES, ...WOMEN_ONLY_TYPES] : COMMON_TYPES;

  // Togglers
  const toggleSize = (size: string) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size]);
  const toggleColor = (color: string) => setSelectedColors(p => p.includes(color) ? p.filter(c => c !== color) : [...p, color]);

  // Generate Variants
  const generateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      alert("⚠️ Оберіть хоча б один розмір та колір!");
      return;
    }

    const newVariants: VariantItem[] = [];
    
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        const existing = variants.find(v => v.color === color && v.size === size);
        newVariants.push({
          id: `${color}-${size}`,
          color,
          size,
          stock: existing ? existing.stock : 0 
        });
      });
    });
    setVariants(newVariants);
  };

  const updateVariantStock = (id: string, newStock: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, stock: Number(newStock) } : v));
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price) {
      alert("❌ Заповніть назву та ціну!");
      return;
    }

    if (!foundCategory) {
      alert(`⚠️ Категорія "${targetSlug}" не знайдена в базі.`);
      return;
    }

    const mainImage = imageUrl || (images.length > 0 ? images[0].url : "");

    setLoading(true);

    const payload = {
      title,
      description,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      imageUrl: mainImage,
      categoryId: foundCategory.id,
      variants: variants, 
      images: images 
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Товар успішно створено!');
        router.push('/admin');
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`❌ Помилка: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('❌ Помилка мережі.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-xl bg-white text-black font-bold focus:ring-2 ring-black outline-none placeholder-gray-500";
  const labelStyle = "block text-xs font-black text-black uppercase mb-2";

  return (
    <div className="max-w-4xl mx-auto my-10">
      <h1 className="text-3xl font-black mb-8">Додати новий товар</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
      
        {/* 1. MAIN INFO */}
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button type="button" onClick={() => setGender('men')}
                className={`py-3 rounded-lg font-black text-sm uppercase transition-all ${gender === 'men' ? 'bg-black text-white shadow-md' : 'text-black hover:bg-gray-200'}`}>
                👱‍♂️ Чоловікам
                </button>
                <button type="button" onClick={() => setGender('women')}
                className={`py-3 rounded-lg font-black text-sm uppercase transition-all ${gender === 'women' ? 'bg-pink-600 text-white shadow-md' : 'text-black hover:bg-gray-200'}`}>
                👩 Жінкам
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                <label className={labelStyle}>Назва</label>
                <input required type="text" className={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Напр: Літні шорти" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className={labelStyle}>Ціна</label>
                        <input required type="number" className={inputStyle} value={price} onChange={e => setPrice(e.target.value)} placeholder="1200" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-red-500 uppercase mb-2">Стара ціна</label>
                        <input type="number" className={`${inputStyle} border-red-100 focus:ring-red-200`} value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="(знижка)" />
                    </div>
                </div>
            </div>

            {/* CATEGORY */}
            <div className={`p-6 rounded-xl border ${foundCategory ? 'bg-gray-50 border-gray-300' : 'bg-red-50 border-red-200'}`}>
                <label className="block text-xs font-black text-black uppercase mb-2">
                Категорія ({gender === 'men' ? 'Чоловіки' : 'Жінки'})
                </label>
                
                <select 
                className="w-full p-3 border border-gray-300 rounded-xl bg-white text-black font-bold cursor-pointer outline-none"
                value={type}
                onChange={e => setType(e.target.value)}
                >
                {availableTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
                </select>

                <div className="mt-3 flex items-center justify-between text-xs font-mono text-black">
                    <span>Slug: <strong>{targetSlug}</strong></span>
                    {foundCategory ? (
                        <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded border border-green-200">
                        ✅ ID: {foundCategory.id}
                        </span>
                    ) : (
                        <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded animate-pulse border border-red-200">
                        ❌ Не знайдено (run seed)
                        </span>
                    )}
                </div>
            </div>

            {/* IMAGE UPLOADER */}
            <div>
               <label className={labelStyle}>Фотографії товару</label>
               <ImageUploader 
                 existingImages={images} 
                 colors={availableColors} 
                 onImagesChange={setImages} 
               />
            </div>

            {/* Manual Image URL (Fallback) */}
            <div>
                <label className={labelStyle}>Фото URL (або залиште пустим, якщо завантажили вище)</label>
                <input type="text" className={inputStyle} value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>

            <div>
                <label className={labelStyle}>Опис</label>
                <textarea rows={3} className={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Опис товару..." />
            </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2. VARIANTS CONFIG */}
        <div className="space-y-6">
            <h2 className="text-xl font-black uppercase">Варіанти та Склад</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                
                {/* Size Selector */}
                <div>
                    <label className={labelStyle}>1. Оберіть Розміри</label>
                    <div className="flex gap-2 flex-wrap">
                        {availableSizes.map(size => (
                        <button 
                            key={size} type="button" onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded-lg font-bold border-2 transition-all duration-200 ${selectedSizes.includes(size) ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-900 border-gray-300 hover:border-slate-900'}`}
                        >
                            {size}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Color Selector */}
                <div>
                    <label className={labelStyle}>2. Оберіть Кольори</label>
                    <div className="flex gap-2 flex-wrap">
                        {availableColors.map(color => (
                        <button 
                            key={color} type="button" onClick={() => toggleColor(color)}
                            className={`px-4 py-2 rounded-lg font-bold border-2 capitalize transition-all duration-200 ${selectedColors.includes(color) ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-900 border-gray-300 hover:border-slate-900'}`}
                        >
                            {color}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button type="button" onClick={generateVariants} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow">
                    🔄 Згенерувати таблицю кількості
                </button>

            </div>

            {/* VARIANTS TABLE */}
            {variants.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-100 text-xs uppercase font-black text-gray-500 border-b">
                            <tr>
                                <th className="p-4">Колір</th>
                                <th className="p-4">Розмір</th>
                                <th className="p-4 w-40">Кількість (шт)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {variants.map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold capitalize">{v.color}</td>
                                    <td className="p-4 font-bold">{v.size}</td>
                                    <td className="p-4">
                                        <input 
                                            type="number" min="0" 
                                            value={v.stock}
                                            onChange={(e) => updateVariantStock(v.id, e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded font-bold text-center focus:ring-2 ring-black outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* SAVE BUTTON */}
        <button disabled={loading || !foundCategory} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50 text-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1">
            {loading ? 'Збереження...' : '✅ Створити Товар'}
        </button>

      </form>
    </div>
  );
}