import { db, initDb } from './client';
import { categories } from './schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const initialCategories = [
  // Expenses
  { name: 'Продукты', type: 'expense' as const, icon: 'ShoppingCart', color: '#10B981' },
  { name: 'Коммуналка', type: 'expense' as const, icon: 'Home', color: '#3B82F6' },
  { name: 'Аренда', type: 'expense' as const, icon: 'Key', color: '#6366F1' },
  { name: 'Транспорт', type: 'expense' as const, icon: 'Car', color: '#F59E0B' },
  { name: 'Развлечения', type: 'expense' as const, icon: 'Film', color: '#EC4899' },
  { name: 'Здоровье', type: 'expense' as const, icon: 'HeartPulse', color: '#EF4444' },
  { name: 'Кафе и рестораны', type: 'expense' as const, icon: 'Utensils', color: '#8B5CF6' },
  { name: 'Прочее', type: 'expense' as const, icon: 'MoreHorizontal', color: '#6B7280' },

  // Income
  { name: 'Зарплата', type: 'income' as const, icon: 'Briefcase', color: '#10B981' },
  { name: 'Подработка', type: 'income' as const, icon: 'Laptop', color: '#06B6D4' },
  { name: 'Премия', type: 'income' as const, icon: 'Award', color: '#F59E0B' },
  { name: 'Процент от вклада', type: 'income' as const, icon: 'TrendingUp', color: '#3B82F6' },
  { name: 'Подарки', type: 'income' as const, icon: 'Gift', color: '#EC4899' },
  { name: 'Прочее', type: 'income' as const, icon: 'MoreHorizontal', color: '#6B7280' },
];

export async function seed() {
  console.log('Ensuring tables exist...');
  await initDb();

  console.log('Seeding initial categories...');
  const now = new Date().toISOString();

  for (const cat of initialCategories) {
    const existing = await db
      .select()
      .from(categories)
      .where(and(eq(categories.name, cat.name), eq(categories.type, cat.type)));

    if (existing.length === 0) {
      await db.insert(categories).values({
        id: randomUUID(),
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        createdAt: now,
      });
      console.log(`+ Added category: [${cat.type}] ${cat.name}`);
    } else {
      console.log(`. Already exists: [${cat.type}] ${cat.name}`);
    }
  }

  console.log('Seeding completed successfully.');
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.includes('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
