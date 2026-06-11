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
  filters: {
    excludedTypes: ['lodging', 'department_store', 'gas_station', 'car_rental', 'supermarket', 'shopping_mall', 'electronics_store', 'convenience_store', 'hardware_store', 'meal_takeaway', 'food_court', 'meal_delivery'],
    minRating: 3.8,
    minReviews: 100,
    requiresPhotos: true,
    requiresOperational: true,
    minPrice: 2,
    nameFilters: ['stall', 'cart', 'truck', 'hawker', 'food court', 'kiosk', 'stand', 'vendor', 'pasar', 'market', 'food centre', 'food center', 'food corner'],
  },
  timestamp: new Date().toISOString(),
}));

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
