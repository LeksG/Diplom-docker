import { prisma } from '@/lib/prisma';
import AdminOrderCard from '@/components/AdminOrderCard'; // Імпортуємо картку
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  // Завантажуємо замовлення (нові зверху)
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Управління замовленнями</h1>
            <p className="text-gray-500">Всього замовлень: {orders.length}</p>
          </div>
          <Link href="/admin" className="text-blue-600 font-bold hover:underline">
            ← Назад до товарів
          </Link>
        </div>

        {/* Список замовлень */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-400 text-lg">Замовлень поки немає</p>
            </div>
          ) : (
            // Для кожного замовлення малюємо нашу "Розумну картку"
            orders.map((order) => (
              <AdminOrderCard key={order.id} order={order} />
            ))
          )}
        </div>

      </div>
    </main>
  );
}