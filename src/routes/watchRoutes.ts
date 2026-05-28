import { FastifyInstance } from 'fastify';
import { watchController } from '../controllers/watchController';

export async function watchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:slug', {
    schema: {
      tags: ['Watch'],
      summary: 'Get watch sources for a movie',
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
          resolve: { type: 'string', enum: ['true', 'false'], default: 'false' },
        },
      },
    },
    handler: watchController.getSources.bind(watchController),
  });
}
