import { prisma } from '@/lib/prisma';
import AdminProductForm from '@/components/AdminProductForm';

// Робимо сторінку динамічною, щоб завжди бачити свіжі категорії
export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  // Завантажуємо категорії для випадаючого списку
  const categories = await prisma.category.findMany();

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Заголовок і кнопка Назад */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Новий товар</h1>
            <p className="text-gray-500">Заповніть форму, щоб додати товар в каталог</p>
          </div>
          <a href="/admin" className="text-sm font-bold text-blue-600 hover:underline">
            ← Назад до списку
          </a>
        </div>

        {/* Форма (Ми її створили раніше в components/AdminProductForm.tsx) */}
        <AdminProductForm categories={categories} />
        
      </div>
    </main>
  );
}