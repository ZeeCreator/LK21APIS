import { FastifyInstance } from 'fastify';
import { sokujaController } from '../controllers/sokujaController';

export async function sokujaRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get Sokuja homepage data (hero, latest, ongoing, completed, popular)',
      querystring: {
        type: 'object',
        properties: {
          refresh: { type: 'string' },
        },
      },
    },
    handler: sokujaController.getHomepage.bind(sokujaController),
  });
}
