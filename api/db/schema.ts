import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(), // UUID v4
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  icon: text('icon').notNull().default('Tag'), // Lucide icon identifier
  color: text('color').notNull().default('#6B7280'), // Hex code
  createdAt: text('created_at').notNull()
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(), // UUID v4
  amount: real('amount').notNull(), // Float with 2 decimals
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO YYYY-MM-DD
  note: text('note'),
  createdAt: text('created_at').notNull()
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
