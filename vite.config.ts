import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function honoDevPlugin(): Plugin {
  return {
    name: 'hono-dev-server',
    async configureServer(server) {
      const { app } = await import('./api/index');
      const { getRequestListener } = await import('@hono/node-server');
      const listener = getRequestListener(app.fetch);
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          return listener(req, res);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), honoDevPlugin()],
  server: {
    port: 3000,
  },
});
