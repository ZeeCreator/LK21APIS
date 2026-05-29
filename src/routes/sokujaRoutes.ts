import { FastifyInstance } from 'fastify';
import { sokujaController } from '../controllers/sokujaController';

export async function sokujaRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get homepage (popular today, latest releases, popular weekly)',
      querystring: {
        type: 'object',
        properties: { refresh: { type: 'string' } },
      },
    },
    handler: sokujaController.getHomepage.bind(sokujaController),
  });

  app.get('/schedule', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get anime schedule by day',
      querystring: {
        type: 'object',
        properties: { refresh: { type: 'string' } },
      },
    },
    handler: sokujaController.getSchedule.bind(sokujaController),
  });

  app.get('/genres', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get all genre lists',
      querystring: {
        type: 'object',
        properties: { refresh: { type: 'string' } },
      },
    },
    handler: sokujaController.getGenreLists.bind(sokujaController),
  });

  app.get('/anime', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get all anime lists (A-Z)',
      querystring: {
        type: 'object',
        properties: { refresh: { type: 'string' } },
      },
    },
    handler: sokujaController.getAnimeLists.bind(sokujaController),
  });

  app.get('/search', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Search anime',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          refresh: { type: 'string' },
        },
        required: ['q'],
      },
    },
    handler: sokujaController.search.bind(sokujaController),
  });
}
