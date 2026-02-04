import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Очищення бази даних...');

  // 1. Видаляємо залежні дані (спочатку товари, потім категорії)
  // Якщо є замовлення, їх теж треба було б чистити або OrderItem
  try {
    await prisma.orderItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ Базу очищено.');
  } catch (error) {
    console.log('⚠️ База вже була пуста або виникла помилка очищення (не критично).');
  }

  console.log('🌱 Наповнення категорій згідно зі скріншотами...');

  const categories = [
    // === 👱‍♂️ ЧОЛОВІКАМ (З першого фото) ===
    { name: 'Худі та Світшоти', slug: 'men-hoodies' },
    { name: 'Штани', slug: 'men-pants' },
    { name: 'Футболки та Поло', slug: 'men-tshirts' },
    { name: 'Спортивні костюми', slug: 'men-suits' },
    { name: 'Сорочки', slug: 'men-shirts' },
    { name: 'Куртки', slug: 'men-jackets' },
    { name: 'Шорти', slug: 'men-shorts' },
    { name: 'Пальто', slug: 'men-coats' },

    // === 👩 ЖІНКАМ (З другого фото) ===
    { name: 'Худі та Світшоти (Жін)', slug: 'women-hoodies' }, // Додав уточнення в назві, щоб не плутати, або можна просто "Худі та Світшоти"
    { name: 'Штани (Жін)', slug: 'women-pants' },
    { name: 'Футболки та Поло (Жін)', slug: 'women-tshirts' },
    { name: 'Спортивні костюми (Жін)', slug: 'women-suits' },
    { name: 'Сукні', slug: 'women-dresses' },
    { name: 'Топи', slug: 'women-tops' },
    { name: 'Сорочки (Жін)', slug: 'women-shirts' },
    { name: 'Куртки (Жін)', slug: 'women-jackets' },
    { name: 'Шорти (Жін)', slug: 'women-shorts' },
    { name: 'Пальто (Жін)', slug: 'women-coats' },
  ];

  // *Примітка: Я додав приписки (Жін) до однакових назв (як Штани), 
  // бо поле `name` в базі часто буває @unique (унікальним). 
  // Якщо у тебе в схемі name НЕ унікальне, приписки можна прибрати.
  // Але slug точно має бути унікальним.

  for (const cat of categories) {
    // Прибираємо "(Жін)" для красивого відображення в меню, якщо slug вказує на жінку
    // Або залишаємо як є, якщо хочеш розрізняти їх в адмінці.
    // Тут я записую чисту назву, якщо твоя база дозволяє дублікаті по name.
    // Якщо ні - залиш код вище.
    
    // Спроба записати "красиву" назву без дужок, якщо це можливо
    let displayName = cat.name;
    if (cat.slug.startsWith('women-') && cat.name.includes('(Жін)')) {
        displayName = cat.name.replace(' (Жін)', '');
    }

    // Якщо prisma схема вимагає унікального name, код впаде на дублікатах "Штани".
    // Тому безпечніше для бази залишити унікальні імена, 
    // або (найкращий варіант) - дозволити неунікальні name в schema.prisma.
    
    await prisma.category.create({
      data: {
        name: cat.name, // Записуємо унікальне ім'я (з приписками, якщо треба)
        slug: cat.slug,
      },
    });
  }

  console.log(`✅ Створено ${categories.length} категорій!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });