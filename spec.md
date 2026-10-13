
---

```markdown
# Technical Specification: Finance Tracker Web App

## 1. Project Overview & Architecture
* **Target:** Single-repository full-stack application (React + Vite client + Vercel Serverless Node.js backend).
* **Database:** Turso (libSQL) managed via Drizzle ORM.
* **Routing/Deploy:** Deployed to Vercel. Static frontend served from `dist/`, backend API handled via serverless functions in `/api`.

---

## 2. Directory Structure

```text
finance-tracker/
├── api/
│   ├── index.ts                # Express/Hono entrypoint for Vercel Serverless
│   ├── db/
│   │   ├── client.ts           # Turso / Drizzle connection
│   │   ├── schema.ts           # Drizzle table schemas
│   │   └── seed.ts             # Initial categories seeding script
│   └── routes/
│       ├── transactions.ts     # CRUD routes for transactions
│       ├── categories.ts       # CRUD routes for categories
│       └── analytics.ts        # Aggregation endpoints
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives (Button, Modal, Input, Card)
│   │   ├── Analytics/          # ExpenseDonutChart, SummaryCards, IncomeExpenseBar
│   │   ├── Categories/         # CategoryBadge, CategorySelect
│   │   └── Transactions/       # TransactionForm, TransactionList, TransactionItem
│   ├── hooks/
│   │   └── useFinanceData.ts   # Data fetching/mutation hooks (TanStack Query)
│   ├── lib/
│   │   ├── api.ts              # Fetch client wrapper
│   │   └── utils.ts            # Formatting helpers (currency, date)
│   ├── types/
│   │   └── index.ts            # Shared frontend TypeScript interfaces
│   ├── App.tsx                 # Main layout & view switching
│   ├── main.tsx                # React root
│   └── index.css               # Tailwind directives
├── drizzle/                    # Generated SQL migrations (drizzle-kit)
├── .env.example
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vercel.json
└── vite.config.ts
```

---

## 3. Environment Variables (`.env.example`)

```bash
# Turso Database Configuration
TURSO_DATABASE_URL="libsql://[your-db-name].turso.io"
TURSO_AUTH_TOKEN="your-turso-jwt-token"

# App Port (Local dev)
PORT=3000
```

---

## 4. Database Schema (`api/db/schema.ts`)

Используется **Drizzle ORM** с `@libsql/client`.

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

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
```

### Seed Data (`api/db/seed.ts`)
При первой инициализации БД необходимо наполнить предустановленными категориями:
* **Расходы (`expense`):**
  * `Продукты` (icon: `ShoppingCart`, color: `#10B981`)
  * `Коммуналка` (icon: `Home`, color: `#3B82F6`)
  * `Аренда` (icon: `Key`, color: `#6366F1`)
  * `Транспорт` (icon: `Car`, color: `#F59E0B`)
  * `Развлечения` (icon: `Film`, color: `#EC4899`)
  * `Здоровье` (icon: `HeartPulse`, color: `#EF4444`)
  * `Кафе и рестораны` (icon: `Utensils`, color: `#8B5CF6`)
  * `Прочее` (icon: `MoreHorizontal`, color: `#6B7280`)
* **Доходы (`income`):**
  * `Зарплата` (icon: `Briefcase`, color: `#10B981`)
  * `Подработка` (icon: `Laptop`, color: `#06B6D4`)
  * `Премия` (icon: `Award`, color: `#F59E0B`)
  * `Процент от вклада` (icon: `TrendingUp`, color: `#3B82F6`)
  * `Подарки` (icon: `Gift`, color: `#EC4899`)
  * `Прочее` (icon: `MoreHorizontal`, color: `#6B7280`)

---

## 5. API Contracts & Endpoints

Все роуты принимают и возвращают данные в формате `application/json`. Обработка на бэкенде через **Hono** (оптимально для Vercel Serverless) или **Express**.

### 5.1. Categories
* **`GET /api/categories`**
  * Query: `?type=income|expense` (optional)
  * Response: `Category[]`
* **`POST /api/categories`**
  * Body: `{ name: string, type: 'income' | 'expense', icon?: string, color?: string }`
  * Response: Created `Category` (Status 201)

### 5.2. Transactions
* **`GET /api/transactions`**
  * Query params:
    * `from` (ISO Date string, optional)
    * `to` (ISO Date string, optional)
    * `type` (`income` | `expense`, optional)
    * `categoryId` (string, optional)
  * Response: Array of transactions joined with category details:
    ```typescript
    Array<{
      id: string;
      amount: number;
      type: 'income' | 'expense';
      categoryId: string;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      date: string;
      note: string | null;
      createdAt: string;
    }>
    ```
* **`POST /api/transactions`**
  * Body validation (via Zod):
    ```typescript
    {
      amount: number; // positive number > 0
      type: 'income' | 'expense';
      categoryId: string;
      date: string; // ISO date YYYY-MM-DD
      note?: string;
    }
    ```
  * Response: Created `Transaction` (Status 201)
* **`DELETE /api/transactions/:id`**
  * Response: `{ success: true, id: string }`

### 5.3. Analytics
* **`GET /api/analytics/summary`**
  * Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
  * Response:
    ```json
    {
      "totalIncome": 125000.00,
      "totalExpense": 84500.50,
      "netBalance": 40499.50
    }
    ```
* **`GET /api/analytics/by-category`**
  * Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD&type=expense`
  * Response:
    ```json
    [
      { "categoryId": "uuid", "categoryName": "Продукты", "color": "#10B981", "total": 35000.00 },
      { "categoryId": "uuid", "categoryName": "Коммуналка", "color": "#3B82F6", "total": 9500.50 }
    ]
    ```

---

## 6. Frontend Requirements & UI State

### 6.1. Libraries to Install
* `lucide-react` (icons)
* `recharts` (charts)
* `@tanstack/react-query` (server state management)
* `clsx` + `tailwind-merge` (UI utility)

### 6.2. Views & Screens
1. **Header / Summary Bar:**
   * Селектор периода (Текущий месяц, Прошлый месяц, Все время).
   * Карточки показателей: Текущий баланс, Доход за период, Расход за период.
2. **Action Bar:**
   * Кнопка быстрого добавления `+ Новая операция` (открывает модальное окно или Bottom Sheet).
3. **Main Content (Две вкладки или разделенные секции):**
   * **Вкладка "Операции":**
     * Список транзакций, сгруппированный по датам (новые сверху).
     * Каждая строка содержит: иконку категории, имя категории, заметку, дату, сумму (`+ 10,000 ₽` зеленая или `- 2,500 ₽` красная), кнопку удаления.
   * **Вкладка "Аналитика":**
     * Donut Chart (расходы по категориям с легендой).
     * Сводный список сумм и процентов по категориям.
4. **Modal "Добавить операцию":**
   * Переключатель типа (`Расход` / `Доход`).
   * Поле суммы (большой числовой ввод).
   * Сетка выбора категории с иконками.
   * Выбор даты (по умолчанию сегодня).
   * Текстовое поле для комментария.

---

## 7. Deployment & Configuration Files

### 7.1. `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 7.2. Root `package.json` Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:seed": "tsx api/db/seed.ts"
  }
}
```

---

## 8. Implementation Checklist for Antigravity CLI

- [ ] **Step 1: Project Setup**
  - Initialize Vite React + TypeScript project in root.
  - Setup Tailwind CSS, Lucide React, Recharts, TanStack Query.
  - Setup Turso client (`@libsql/client`) and Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- [ ] **Step 2: Database Layer**
  - Configure `api/db/client.ts` to read `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
  - Create `api/db/schema.ts` with `categories` and `transactions`.
  - Create and run `api/db/seed.ts` to seed initial income/expense categories.
- [ ] **Step 3: Backend Routes (`api/`)**
  - Setup Hono/Express entry point in `api/index.ts`.
  - Implement `/api/categories` (GET, POST).
  - Implement `/api/transactions` (GET, POST, DELETE).
  - Implement `/api/analytics` summary & aggregation endpoints.
- [ ] **Step 4: Frontend Implementation**
  - Setup API client (`src/lib/api.ts`) and React Query hooks.
  - Build UI layout and summary cards (`SummaryCards.tsx`).
  - Build `TransactionForm` modal with validation.
  - Build `TransactionList` with date formatting and delete action.
  - Integrate Recharts Donut chart for category expense analytics.
- [ ] **Step 5: Testing & Deployment Readiness**
  - Verify local build: `npm run build`.
  - Verify API endpoints handle empty states and invalid payloads gracefully.
  - Ensure `.env.example` is complete and `vercel.json` rewrites are active.
```