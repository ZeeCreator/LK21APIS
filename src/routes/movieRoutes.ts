import { FastifyInstance } from 'fastify';
import { movieController } from '../controllers/movieController';

export async function movieRoutes(app: FastifyInstance): Promise<void> {
  app.get('/latest', {
    schema: {
      tags: ['Movies'],
      summary: 'Get latest movies',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
    handler: movieController.getLatest.bind(movieController),
  });

  app.get('/trending', {
    schema: {
      tags: ['Movies'],
      summary: 'Get trending movies',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
    handler: movieController.getTrending.bind(movieController),
  });

  app.get('/rebahin', {
    schema: {
      tags: ['Movies'],
      summary: 'Get movies from rebahin',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
    handler: movieController.getRebahin.bind(movieController),
  });

  app.get('/:slug', {
    schema: {
      tags: ['Movies'],
      summary: 'Get movie detail',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: movieController.getDetail.bind(movieController),
  });
}
