import { FastifyInstance } from 'fastify';
import { movieController } from '../controllers/movieController';
import { tvController } from '../controllers/tvController';

export async function seriesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/latest', {
    schema: {
      tags: ['Series'],
      summary: 'Get latest TV series',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
    handler: movieController.getSeries.bind(movieController),
  });

  app.get('/:slug', {
    schema: {
      tags: ['Series'],
      summary: 'Get stream embed URLs for a TV series/episode',
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
    handler: tvController.getStream.bind(tvController),
  });
}
