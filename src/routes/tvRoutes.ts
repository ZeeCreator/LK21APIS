import { FastifyInstance } from 'fastify';
import { tvController } from '../controllers/tvController';

export async function tvRoutes(app: FastifyInstance): Promise<void> {
  app.get('/detail/:slug', {
    schema: {
      tags: ['TV'],
      summary: 'Get TV series detail',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: tvController.getDetail.bind(tvController),
  });
}
