import { FastifyInstance } from 'fastify';
import { subtitleController } from '../controllers/subtitleController';

export async function subtitleRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:slug', {
    schema: {
      tags: ['Subtitles'],
      summary: 'Get subtitles for a movie',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: subtitleController.getSubtitles.bind(subtitleController),
  });
}
