import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { restaurantRoutes } from './routes/restaurants';

dotenv.config();

const app = fastify({ logger: true });

app.register(cors, { origin: '*' });
app.register(restaurantRoutes, { prefix: '/api/restaurants' });

app.get('/health', async () => ({ status: 'ok' }));

app.get('/debug', async () => ({
  status: 'ok',
  apiKeyConfigured: !!process.env.GOOGLE_PLACES_API_KEY,
  apiKeyLength: process.env.GOOGLE_PLACES_API_KEY ? process.env.GOOGLE_PLACES_API_KEY.length : 0,
  timestamp: new Date().toISOString(),
}));

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
