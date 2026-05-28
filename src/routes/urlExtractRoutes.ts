import { FastifyInstance } from 'fastify';
import { urlExtractController } from '../controllers/urlExtractController';

export async function urlExtractRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags: ['UrlExtract'],
      summary: 'Extract direct stream URL (.mp4/.m3u8) from an embed page',
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', description: 'Embed page URL to extract stream from' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'integer' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                type: { type: 'string', enum: ['mp4', 'm3u8', 'embed'] },
              },
            },
          },
        },
      },
    },
    handler: urlExtractController.extract.bind(urlExtractController),
  });
}
