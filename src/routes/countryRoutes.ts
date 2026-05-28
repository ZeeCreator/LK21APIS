import { FastifyInstance } from 'fastify';
import { countryController } from '../controllers/countryController';

export async function countryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Country'],
      summary: 'Get all countries',
    },
    handler: countryController.getAll.bind(countryController),
  });

  app.get('/:slug', {
    schema: {
      tags: ['Country'],
      summary: 'Get movies by country',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
    handler: countryController.getMovies.bind(countryController),
  });
}
