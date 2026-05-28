import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from '../config/env';

export async function setupSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'DutaMovie API',
        description: 'Enterprise-grade REST API for movie scraping and streaming platform',
        version: '1.0.0',
        contact: {
          name: 'DutaMovie Team',
          email: 'admin@dutamovie.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.APP_PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Movies', description: 'Movie endpoints' },
        { name: 'Search', description: 'Search endpoints' },
        { name: 'Genres', description: 'Genre endpoints' },
        { name: 'Country', description: 'Country endpoints' },
        { name: 'Watch', description: 'Watch/stream endpoints' },
        { name: 'Download', description: 'Download endpoints' },
        { name: 'Subtitles', description: 'Subtitle endpoints' },
        { name: 'Admin', description: 'Admin endpoints' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}
