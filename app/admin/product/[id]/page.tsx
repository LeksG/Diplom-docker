'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import { ProductService, CategoryService } from '@/services/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface VariantItem {
  id?: number;
  size: string;
  color: string;
  stock: number;
}

interface ProductImageItem {
  url: string;
  color: string | null;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  //  ДАНІ ТОВАРУ 
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // СТЕЙТ ДЛЯ ГАЛЕРЕЇ
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // КАТЕГОРІЇ 
  const [gender, setGender] = useState('men');
  const [type, setType] = useState('hoodies');
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // ВАРІАНТИ 
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);

  // Списки
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const availableColors = ['чорний', 'білий', 'сірий', 'бежевий', 'синій', 'червоний', 'зелений', 'жовтий', 'коричневий'];
  
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

  // 1. ЗАВАНТАЖЕННЯ ДАНИХ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsData = await CategoryService.getAll();
        setDbCategories(catsData);

        const product = await ProductService.getById(productId);

        setTitle(product.title);
        setPrice(product.price);
        setOldPrice(product.oldPrice || '');
        setImageUrl(product.imageUrl || '');
        setDescription(product.description || '');

        if (product.images && Array.isArray(product.images)) {
            setImages(product.images);
        }

        //ВІДНОВЛЕННЯ ВАРІАНТІВ 
        if (product.variants && product.variants.length > 0) {
            setVariants(product.variants.map((v: any) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock
            })));

            const sizesFromDb = [...new Set(product.variants.map((v: any) => v.size))];
            const colorsFromDb = [...new Set(product.variants.map((v: any) => v.color))];
            
            setSelectedSizes(sizesFromDb as string[]);
            setSelectedColors(colorsFromDb as string[]);
        }

        // Розбираємо категорію
        if (product.category && product.category.slug) {
          const parts = product.category.slug.split('-'); 
          if (parts.length >= 2) {
             setGender(parts[0]);
             setType(parts[1]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        alert('Помилка завантаження даних');
        router.push('/admin');
      }
    };
    fetchData();
  }, [productId, router]);

  const targetSlug = `${gender}-${type}`;
  const foundCategory = dbCategories.find(c => c.slug === targetSlug);

  // Тоглери
  const toggleSize = (size: string) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size]);
  const toggleColor = (color: string) => setSelectedColors(p => p.includes(color) ? p.filter(c => c !== color) : [...p, color]);

  // Генерація варіантів
  const regenerateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      alert("⚠️ Оберіть хоча б один розмір та колір!");
      return;
    }

    const newVariantsList: VariantItem[] = [];
    
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        const existing = variants.find(v => v.color === color && v.size === size);
        
        if (existing) {
          newVariantsList.push(existing);
        } else {
          newVariantsList.push({ size, color, stock: 0 });
        }
      });
    });

    setVariants(newVariantsList);
  };

  const updateMatrixStock = (color: string, size: string, newStock: string) => {
    const updated = [...variants];
    const index = updated.findIndex(v => v.color === color && v.size === size);
    if (index !== -1) {
      updated[index].stock = Number(newStock);
      setVariants(updated);
    }
  };

  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
        'білий': '#ffffff', 'чорний': '#000000', 'сірий': '#9ca3af', 'бежевий': '#f5f5dc',
        'синій': '#2563eb', 'червоний': '#dc2626', 'зелений': '#16a34a', 'жовтий': '#eab308', 'коричневий': '#78350f'
    };
    return map[colorName.toLowerCase()] || '#e5e7eb';
  };

  // 3. ЗАМІНИЛИ ФУНКЦІЮ ЗБЕРЕЖЕННЯ (PATCH)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundCategory) return alert("Помилка категорії");
    setSaving(true);

    const mainImage = imageUrl || (images.length > 0 ? images[0].url : "");

    try {
      //  Викликаємо сервіс 
      await ProductService.update(productId, {
        title,
        description,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        imageUrl: mainImage,
        categoryId: foundCategory.id,
        variants: variants,
        images: images 
      });

      alert(' Товар оновлено!');
      router.push('/admin');
      router.refresh();
      
    } catch (e: any) {
      alert(`Помилка сервера: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 ring-slate-900 outline-none";
  const labelStyle = "block text-xs font-black text-slate-900 uppercase mb-2";

  if (loading) return <div className="p-10 text-center font-bold text-slate-900">Завантаження...</div>;

  const activeColors = [...new Set(variants.map(v => v.color))];
  const activeSizes = [...new Set(variants.map(v => v.size))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black text-slate-900">Редагування #{productId}</h1>
           <Link href="/admin" className="text-gray-500 hover:text-red-500 font-bold">Скасувати</Link>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
          
          {/* ОСНОВНА ІНФО */}
          <div className="space-y-6">
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                    <button type="button" onClick={() => setGender('men')} 
                        className={`flex-1 rounded-lg font-black text-xs uppercase transition-all ${gender === 'men' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-900 hover:bg-gray-200'}`}>
                        Чол
                    </button>
                    <button type="button" onClick={() => setGender('women')} 
                        className={`flex-1 rounded-lg font-black text-xs uppercase transition-all ${gender === 'women' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-900 hover:bg-gray-200'}`}>
                        Жін
                    </button>
                 </div>
                 <select 
                    className="p-3 border border-gray-300 rounded-xl bg-white text-slate-900 font-bold outline-none focus:ring-2 ring-slate-900" 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                 >
                    {availableTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                 </select>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <label className={labelStyle}>Назва</label>
                   <input required type="text" className={inputStyle} value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className={labelStyle}>Ціна</label>
                      <input required type="number" className={inputStyle} value={price} onChange={e => setPrice(e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-xs font-black text-red-500 uppercase mb-2">Знижка (стара ціна)</label>
                      <input type="number" className={`${inputStyle} border-red-200 text-red-600 focus:ring-red-200`} value={oldPrice} onChange={e => setOldPrice(e.target.value)} />
                   </div>
                </div>
             </div>

             {/* БЛОК ДЛЯ ФОТО */}
             <div>
                <label className={labelStyle}>Фотогалерея (Завантажте та оберіть колір)</label>
                <ImageUploader 
                   existingImages={images} 
                   colors={availableColors} 
                   onImagesChange={setImages} 
                />
             </div>

             <div>
                <label className={labelStyle}>Основне фото URL (резерв)</label>
                <input type="text" className={inputStyle} value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
             </div>
             <div>
                <label className={labelStyle}>Опис</label>
                <textarea rows={3} className={inputStyle} value={description} onChange={e => setDescription(e.target.value)} />
             </div>
          </div>

          <hr className="border-gray-200" />

          {/* ВАРІАНТИ */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-black uppercase text-slate-900">📦 Склад та Варіанти</h2>
                <span className="text-xs text-gray-500 font-medium">Оберіть нові кольори/розміри та натисніть "Оновити таблицю"</span>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                
                {/* 1. РОЗМІРИ */}
                <div>
                    <label className={labelStyle}>Доступні Розміри:</label>
                    <div className="flex gap-2 flex-wrap">
                        {availableSizes.map(size => (
                        <button key={size} type="button" onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 rounded-lg font-bold border-2 text-sm transition-all ${selectedSizes.includes(size) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-gray-300 hover:border-slate-900'}`}>
                            {size}
                        </button>
                        ))}
                    </div>
                </div>

                {/* 2. КОЛЬОРИ */}
                <div>
                    <label className={labelStyle}>Доступні Кольори:</label>
                    <div className="flex gap-2 flex-wrap">
                        {availableColors.map(color => (
                        <button key={color} type="button" onClick={() => toggleColor(color)}
                            className={`px-3 py-1.5 rounded-lg font-bold border-2 text-sm capitalize transition-all ${selectedColors.includes(color) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-gray-300 hover:border-slate-900'}`}>
                            {color}
                        </button>
                        ))}
                    </div>
                </div>

                <button type="button" onClick={regenerateVariants} 
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm">
                    🔄 Оновити таблицю
                </button>
            </div>

            {/* ВІЗУАЛ ВАРІАНТІВ  */}
            {variants.length > 0 ? (
                <div className="space-y-3">
                    {activeColors.map(color => (
                        <div key={color} className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-colors">
                            
                            {/* Ліва частина */}
                            <div className="flex items-center gap-3 w-40 flex-shrink-0">
                                <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: getColorHex(color) }}></div>
                                <span className="font-black text-slate-900 text-sm capitalize">{color}</span>
                            </div>

                            {/* Права частина */}
                            <div className="flex flex-wrap gap-3 items-center">
                                {activeSizes.map(size => {
                                    const variant = variants.find(v => v.color === color && v.size === size);
                                    if (!variant) return null;

                                    return (
                                        <div key={size} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-xs font-black text-slate-900 bg-gray-200 px-2 py-1.5 rounded-lg w-10 text-center uppercase tracking-wider">{size}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.stock}
                                                onChange={(e) => updateMatrixStock(color, size, e.target.value)}
                                                className={`w-20 p-2 border rounded-lg font-bold text-center outline-none focus:ring-2 transition-all ${
                                                    variant.stock > 0 
                                                        ? 'border-gray-300 text-slate-900 focus:ring-slate-900' 
                                                        : 'border-red-300 text-red-600 bg-red-50 focus:ring-red-300'
                                                }`}
                                            />
                                            <span className="text-xs font-bold text-gray-400">шт.</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 font-medium">
                    Варіанти відсутні. Оберіть розміри та кольори вище і натисніть "Оновити таблицю".
                </div>
            )}
          </div>

          <button disabled={saving} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50 text-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1">
            {saving ? 'Збереження...' : '💾 Зберегти зміни'}
          </button>
        </form>
      </div>
    </div>
  );
}