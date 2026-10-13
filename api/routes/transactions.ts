import { Hono } from 'hono';
import { db, initDb } from '../db/client';
import { transactions, categories } from '../db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const transactionsRouter = new Hono();

const createTransactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  note: z.string().optional().nullable(),
});

// GET /api/transactions
transactionsRouter.get('/', async (c) => {
  await initDb();
  const from = c.req.query('from');
  const to = c.req.query('to');
  const type = c.req.query('type') as 'income' | 'expense' | undefined;
  const categoryId = c.req.query('categoryId');

  const conditions = [];

  if (from) {
    conditions.push(gte(transactions.date, from));
  }
  if (to) {
    conditions.push(lte(transactions.date, to));
  }
  if (type === 'income' || type === 'expense') {
    conditions.push(eq(transactions.type, type));
  }
  if (categoryId) {
    conditions.push(eq(transactions.categoryId, categoryId));
  }

  const query = db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      date: transactions.date,
      note: transactions.note,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  const results = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  return c.json(results);
});

// POST /api/transactions
transactionsRouter.post('/', async (c) => {
  await initDb();
  const body = await c.req.json().catch(() => null);
  const parsed = createTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.format() }, 400);
  }

  const { amount, type, categoryId, date, note } = parsed.data;

  // Validate category exists and matches type
  const [existingCat] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!existingCat) {
    return c.json({ error: 'Category not found' }, 404);
  }

  const newTx = {
    id: randomUUID(),
    amount: Math.round(amount * 100) / 100,
    type,
    categoryId,
    date,
    note: note?.trim() || null,
    createdAt: new Date().toISOString(),
  };

  await db.insert(transactions).values(newTx);
  return c.json(newTx, 201);
});

// DELETE /api/transactions/:id
transactionsRouter.delete('/:id', async (c) => {
  await initDb();
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id));

  if (!existing) {
    return c.json({ error: 'Transaction not found' }, 404);
  }

  await db.delete(transactions).where(eq(transactions.id, id));
  return c.json({ success: true, id });
});
