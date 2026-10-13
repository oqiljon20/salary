import { Hono } from 'hono';
import { db, initDb } from '../db/client';
import { categories } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const categoriesRouter = new Hono();

const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional().default('Tag'),
  color: z.string().optional().default('#6B7280'),
});

// GET /api/categories
categoriesRouter.get('/', async (c) => {
  await initDb();
  const type = c.req.query('type') as 'income' | 'expense' | undefined;

  let query = db.select().from(categories);
  if (type === 'income' || type === 'expense') {
    const data = await query.where(eq(categories.type, type)).orderBy(asc(categories.name));
    return c.json(data);
  }

  const data = await query.orderBy(asc(categories.name));
  return c.json(data);
});

// POST /api/categories
categoriesRouter.post('/', async (c) => {
  await initDb();
  const body = await c.req.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.format() }, 400);
  }

  const { name, type, icon, color } = parsed.data;
  const newCategory = {
    id: randomUUID(),
    name,
    type,
    icon: icon || 'Tag',
    color: color || '#6B7280',
    createdAt: new Date().toISOString(),
  };

  await db.insert(categories).values(newCategory);
  return c.json(newCategory, 201);
});
