import { Hono } from 'hono';
import { db, initDb } from '../db/client';
import { transactions, categories } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const analyticsRouter = new Hono();

// GET /api/analytics/summary
analyticsRouter.get('/summary', async (c) => {
  await initDb();
  const from = c.req.query('from');
  const to = c.req.query('to');

  const conditions = [];
  if (from) {
    conditions.push(gte(transactions.date, from));
  }
  if (to) {
    conditions.push(lte(transactions.date, to));
  }

  const query = db.select({
    amount: transactions.amount,
    type: transactions.type,
  }).from(transactions);

  const txs = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of txs) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  }

  totalIncome = Math.round(totalIncome * 100) / 100;
  totalExpense = Math.round(totalExpense * 100) / 100;
  const netBalance = Math.round((totalIncome - totalExpense) * 100) / 100;

  return c.json({
    totalIncome,
    totalExpense,
    netBalance,
  });
});

// GET /api/analytics/by-category
analyticsRouter.get('/by-category', async (c) => {
  await initDb();
  const from = c.req.query('from');
  const to = c.req.query('to');
  const type = (c.req.query('type') as 'income' | 'expense') || 'expense';

  const conditions = [eq(transactions.type, type)];
  if (from) {
    conditions.push(gte(transactions.date, from));
  }
  if (to) {
    conditions.push(lte(transactions.date, to));
  }

  const query = db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      color: categories.color,
      amount: transactions.amount,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions));

  const rows = await query;

  const map = new Map<string, { categoryId: string; categoryName: string; color: string; total: number }>();

  for (const row of rows) {
    const existing = map.get(row.categoryId);
    if (existing) {
      existing.total += row.amount;
    } else {
      map.set(row.categoryId, {
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        color: row.color,
        total: row.amount,
      });
    }
  }

  const result = Array.from(map.values())
    .map((item) => ({
      ...item,
      total: Math.round(item.total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);

  return c.json(result);
});
