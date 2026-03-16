'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaService } from '@/services/api';

interface ImageItem {
  url: string;
  color: string | null;
}

interface Props {
  existingImages: ImageItem[];
  colors: string[];
  onImagesChange: (images: ImageItem[]) => void;
}

export default function ImageUploader({ existingImages, colors, onImagesChange }: Props) {
  const [uploading, setUploading] = useState(false);
  
  //СТЕЙТ ДЛЯ МЕДІАБІБЛІОТЕКИ
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [dbImages, setDbImages] = useState<string[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    try {
      // 1. Завантажуємо в Supabase
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      // 2. Отримуємо публічне URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // 3. Додаємо в список
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
    newImages[index].color = color === "" ? null : color;
    onImagesChange(newImages);
  };

  // ЛОГІКА МЕДІАБІБЛІОТЕКИ
  const loadImagesFromDb = async () => {
    setIsGalleryOpen(true);
    setLoadingDb(true);
    try {
      const data = await MediaService.getAll();
      setDbImages(data);
    } catch (e: any) {
      console.error('Помилка сервера при завантаженні медіа:', e.message);
    } finally {
      setLoadingDb(false);
    }
  };

  const selectImageFromDb = (url: string) => {
    onImagesChange([...existingImages, { url, color: null }]);
    setIsGalleryOpen(false); 
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      
      {/* Кнопки управління */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-2">
          {uploading ? 'Завантаження...' : 'Додати з ПК'}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </label>
        
        <button 
          type="button" 
          onClick={loadImagesFromDb}
          className="bg-white text-slate-900 border-2 border-slate-900 px-5 py-2 rounded-lg font-bold hover:bg-slate-100 transition shadow-sm flex items-center gap-2"
        >
          Вибрати з бази
        </button>
      </div>
      
      <div className="text-xs text-gray-500 font-medium font-mono">
        Завантажте нові фото або оберіть існуючі та прив'яжіть їх до відповідного кольору
      </div>

      {/* Список вибраних фото для товару */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {existingImages.map((img, idx) => (
            <div key={idx} className="relative group bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <img src={img.url} alt="preview" className="w-full aspect-square object-cover rounded-lg mb-3 border border-gray-100" />
              
              <select 
                className="w-full p-2 text-xs bg-slate-900 text-white rounded-lg font-bold outline-none cursor-pointer"
                value={img.color || ""}
                onChange={(e) => updateImageColor(idx, e.target.value)}
              >
                <option value="">Для всіх кольорів</option>
                {colors.map(c => (
                  <option key={c} value={c} className="capitalize">Тільки {c}</option>
                ))}
              </select>

              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО ГАЛЕРЕЇ */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Хедер модалки */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">🖼️ Медіабібліотека</h3>
              <button onClick={() => setIsGalleryOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Вміст модалки */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {loadingDb ? (
                <div className="text-center text-slate-900 font-bold p-16 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Завантаження архіву фотографій...
                </div>
              ) : dbImages.length === 0 ? (
                <div className="text-center text-gray-500 p-16 font-medium text-lg border-2 border-dashed border-gray-300 rounded-xl">
                  База фотографій поки що порожня. <br/> Завантажте перші фото з ПК!
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {dbImages.map((url, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectImageFromDb(url)}
                      className="cursor-pointer border-2 border-transparent hover:border-slate-900 rounded-xl overflow-hidden aspect-square relative group bg-white shadow-sm transition-all"
                    >
                      <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white text-slate-900 text-sm font-black px-4 py-2 rounded-lg shadow-lg scale-90 group-hover:scale-100 transition-transform">
                          Вибрати
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}