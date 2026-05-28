import { FastifyInstance } from 'fastify';
import { downloadController } from '../controllers/downloadController';

export async function downloadRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:slug', {
    schema: {
      tags: ['Download'],
      summary: 'Get download links for a movie',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: downloadController.getLinks.bind(downloadController),
  });
}
