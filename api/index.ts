import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { serve } from '@hono/node-server';
import { categoriesRouter } from './routes/categories';
import { transactionsRouter } from './routes/transactions';
import { analyticsRouter } from './routes/analytics';

const app = new Hono();

// Sub-router for API
const api = new Hono();
api.route('/categories', categoriesRouter);
api.route('/transactions', transactionsRouter);
api.route('/analytics', analyticsRouter);

// Mount under both /api and root to handle any rewrite configuration seamlessly
app.route('/api', api);
app.route('/', api);

// Direct execution in local development if executed via `tsx api/index.ts`
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const isDirect = process.argv[1]?.includes('api/index') || process.argv[1]?.includes('api\\index');
  if (isDirect) {
    const port = Number(process.env.PORT) || 3000;
    console.log(`Server running at http://localhost:${port}`);
    serve({
      fetch: app.fetch,
      port,
    });
  }
}

export { app };
export default handle(app);
