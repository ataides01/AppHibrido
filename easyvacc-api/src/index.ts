import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerJwt } from './plugins/auth-jwt.js';
import { authRoutes } from './routes/auth.js';
import { meRoutes } from './routes/me.js';
import { catalogRoutes } from './routes/catalog.js';

const port = Number(process.env.PORT) || 3333;
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 16) {
  console.error('Defina JWT_SECRET com pelo menos 16 caracteres no .env');
  process.exit(1);
}

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await registerJwt(app, secret);

await app.register(authRoutes, { prefix: '/api' });
await app.register(meRoutes, { prefix: '/api' });
await app.register(catalogRoutes, { prefix: '/api' });

app.get('/health', async () => ({ ok: true }));

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`EasyVacc API em http://localhost:${port} (API: /api/*)`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
