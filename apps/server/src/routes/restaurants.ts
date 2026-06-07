import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GooglePlacesService } from '../services/googlePlaces';

interface NearbyQuery {
  lat: string;
  lng: string;
  radius?: string;
  type?: string;
}

export async function restaurantRoutes(app: FastifyInstance) {
  const service = new GooglePlacesService();

  app.get('/nearby', async (
    request: FastifyRequest<{ Querystring: NearbyQuery }>,
    reply: FastifyReply
  ) => {
    const { lat, lng, radius = '5000', type = 'restaurant' } = request.query;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return reply.status(400).send({ error: 'Invalid coordinates' });
    }

    try {
      const restaurants = await service.searchNearby(latNum, lngNum, radiusNum, type);
      return restaurants;
    } catch (err: any) {
      request.log.error({ msg: 'Google Places search failed', error: err.message, stack: err.stack });
      if (err.message?.includes('GOOGLE_PLACES_API_KEY not configured')) {
        return reply.status(500).send({ error: 'Service configuration error' });
      }
      return reply.status(500).send({ error: 'Service unavailable', detail: err.message });
    }
  });
}
