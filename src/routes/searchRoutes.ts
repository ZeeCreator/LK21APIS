import { FastifyInstance } from 'fastify';
import { searchController } from '../controllers/searchController';

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Search'],
      summary: 'Search movies',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
        },
        required: ['q'],
      },
    },
    handler: searchController.search.bind(searchController),
  });
}
