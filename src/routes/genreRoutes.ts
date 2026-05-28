import { FastifyInstance } from 'fastify';
import { genreController } from '../controllers/genreController';

export async function genreRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Genres'],
      summary: 'Get all genres',
    },
    handler: genreController.getAll.bind(genreController),
  });

  app.get('/:slug', {
    schema: {
      tags: ['Genres'],
      summary: 'Get movies by genre',
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
    handler: genreController.getMovies.bind(genreController),
  });
}
