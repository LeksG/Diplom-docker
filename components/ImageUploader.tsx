'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageItem {
  url: string;
  color: string | null;
}

interface Props {
  existingImages: ImageItem[];
  colors: string[]; // Доступні кольори товару
  onImagesChange: (images: ImageItem[]) => void;
}

export default function ImageUploader({ existingImages, colors, onImagesChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    // Генеруємо унікальне ім'я: date-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    try {
      // 1. Завантажуємо в Supabase
      const { data, error } = await supabase.storage
        .from('products') // Назва вашого бакета
        .upload(fileName, file);

      if (error) throw error;

      // 2. Отримуємо публічне URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // 3. Додаємо в список (за замовчуванням без кольору)
      const newImage = { url: urlData.publicUrl, color: null };
      onImagesChange([...existingImages, newImage]);

    } catch (error) {
      console.error('Помилка завантаження:', error);
      alert('Не вдалося завантажити фото');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const updateImageColor = (index: number, color: string) => {
    const newImages = [...existingImages];
    // Якщо вибрано "Загальне" (value=""), ставимо null
    newImages[index].color = color === "" ? null : color;
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
      <h3 className="font-bold text-sm uppercase">Галерея фото</h3>

      {/* Кнопка завантаження */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition">
          {uploading ? 'Завантаження...' : '📂 Додати фото'}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </label>
        <span className="text-xs text-gray-500">Завантажте фото та прив'яжіть до кольору</span>
      </div>

      {/* Список фото */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {existingImages.map((img, idx) => (
          <div key={idx} className="relative group bg-white p-2 rounded-lg border shadow-sm">
            <img src={img.url} alt="preview" className="w-full h-32 object-cover rounded-md mb-2" />
            
            {/* Вибір кольору */}
            <select 
              className="w-full p-1 text-xs border rounded font-bold"
              value={img.color || ""}
              onChange={(e) => updateImageColor(idx, e.target.value)}
            >
              <option value="">🎨 Для всіх кольорів</option>
              {colors.map(c => (
                <option key={c} value={c}>Тільки {c}</option>
              ))}
            </select>

            {/* Кнопка видалення */}
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}