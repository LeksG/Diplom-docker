'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 👇 Імпортуємо компонент завантаження (переконайтесь, що шлях правильний)
import ImageUploader from '@/components/ImageUploader';

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

// 👇 Інтерфейс для картинки
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

  // === ДАНІ ТОВАРУ ===
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // 👇 СТЕЙТ ДЛЯ ГАЛЕРЕЇ
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // === КАТЕГОРІЇ ===
  const [gender, setGender] = useState('men');
  const [type, setType] = useState('hoodies');
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // === ВАРІАНТИ (SKU) ===
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
        const catsRes = await fetch('/api/categories');
        if (catsRes.ok) setDbCategories(await catsRes.json());

        const prodRes = await fetch(`/api/products/${productId}`);
        if (!prodRes.ok) throw new Error('Product not found');
        const product = await prodRes.json();

        setTitle(product.title);
        setPrice(product.price);
        setOldPrice(product.oldPrice || '');
        setImageUrl(product.imageUrl || '');
        setDescription(product.description || '');

        // 👇 ЗАВАНТАЖУЄМО ГАЛЕРЕЮ З БАЗИ В СТЕЙТ
        if (product.images && Array.isArray(product.images)) {
            setImages(product.images);
        }

        // === ВІДНОВЛЕННЯ ВАРІАНТІВ ===
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

  const updateVariantStock = (index: number, newStock: string) => {
    const updated = [...variants];
    updated[index].stock = Number(newStock);
    setVariants(updated);
  };

  // Збереження (PATCH)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundCategory) return alert("Помилка категорії");
    setSaving(true);

    // Якщо головне фото не задане вручну, беремо перше з галереї як "обкладинку"
    const mainImage = imageUrl || (images.length > 0 ? images[0].url : "");

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          imageUrl: mainImage,
          categoryId: foundCategory.id,
          variants: variants,
          images: images // 👇 ВІДПРАВЛЯЄМО МАСИВ КАРТИНОК НА ВАШ ГОТОВИЙ API
        }),
      });

      if (res.ok) {
        alert('✅ Товар оновлено!');
        router.push('/admin');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Помилка: ${err.error}`);
      }
    } catch (e) {
      alert('Помилка сервера');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full p-3 border rounded-xl bg-gray-50 text-slate-900 font-bold focus:ring-2 ring-blue-500 outline-none";
  const labelStyle = "block text-xs font-black text-black uppercase mb-2";

  if (loading) return <div className="p-10 text-center font-bold">Завантаження...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black text-slate-900">Редагування #{productId}</h1>
           <Link href="/admin" className="text-gray-500 hover:text-red-500 font-bold">Скасувати</Link>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
          
          {/* ОСНОВНА ІНФО */}
          <div className="space-y-6">
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button type="button" onClick={() => setGender('men')} className={`flex-1 rounded-lg font-black text-xs uppercase ${gender === 'men' ? 'bg-slate-900 text-white' : 'text-gray-500'}`}>Чол</button>
                    <button type="button" onClick={() => setGender('women')} className={`flex-1 rounded-lg font-black text-xs uppercase ${gender === 'women' ? 'bg-pink-600 text-white' : 'text-gray-500'}`}>Жін</button>
                 </div>
                 <select className="p-3 border rounded-xl bg-white font-bold outline-none" value={type} onChange={e => setType(e.target.value)}>
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
                      <input type="number" className={`${inputStyle} border-red-100`} value={oldPrice} onChange={e => setOldPrice(e.target.value)} />
                   </div>
                </div>
             </div>

             {/* 👇 ТУТ ДОДАНО БЛОК ДЛЯ ФОТО */}
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
                <h2 className="text-xl font-black uppercase">📦 Склад та Варіанти</h2>
                <span className="text-xs text-gray-500 font-medium">Оберіть нові кольори/розміри та натисніть "Оновити таблицю"</span>
            </div>
            
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-6">
                
                {/* 1. РОЗМІРИ */}
                <div>
                    <label className={labelStyle}>Доступні Розміри:</label>
                    <div className="flex gap-2 flex-wrap">
                        {availableSizes.map(size => (
                        <button key={size} type="button" onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 rounded-lg font-bold border-2 text-sm transition-all ${selectedSizes.includes(size) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-gray-200'}`}>
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
                            className={`px-3 py-1.5 rounded-lg font-bold border-2 text-sm capitalize transition-all ${selectedColors.includes(color) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-gray-200'}`}>
                            {color}
                        </button>
                        ))}
                    </div>
                </div>

                <button type="button" onClick={regenerateVariants} 
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    🔄 Оновити таблицю
                </button>
            </div>

            {variants.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-100 text-xs uppercase font-black text-gray-500 border-b">
                            <tr>
                                <th className="p-4 pl-6">Варіант</th>
                                <th className="p-4">Кількість на складі</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {variants.map((v, idx) => (
                                <tr key={`${v.color}-${v.size}`} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full border shadow-sm" style={{backgroundColor: v.color === 'білий' ? '#fff' : v.color === 'чорний' ? '#000' : v.color === 'червоний' ? 'red' : v.color === 'синій' ? 'blue' : 'gray'}}></div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm capitalize">{v.color}</div>
                                                <div className="text-xs text-gray-500 font-bold bg-gray-200 px-1.5 rounded inline-block">{v.size}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="0" 
                                                value={v.stock}
                                                onChange={(e) => updateVariantStock(idx, e.target.value)}
                                                className={`w-24 p-2 border rounded-lg font-bold text-center outline-none focus:ring-2 ${v.stock > 0 ? 'border-gray-300 text-slate-900 ring-slate-900' : 'border-red-300 text-red-600 bg-red-50 ring-red-200'}`}
                                            />
                                            <span className="text-xs font-bold text-gray-400">шт.</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                    Варіанти відсутні.
                </div>
            )}
          </div>

          <button disabled={saving} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50 text-lg">
            {saving ? 'Збереження...' : '💾 Зберегти зміни'}
          </button>
        </form>
      </div>
    </div>
  );
}