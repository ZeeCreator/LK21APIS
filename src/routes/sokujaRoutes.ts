import { FastifyInstance } from 'fastify';
import { sokujaController } from '../controllers/sokujaController';

export async function sokujaRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get homepage (popular today, latest releases, popular weekly)',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getHomepage.bind(sokujaController),
  });

  app.get('/schedule', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get anime schedule by day',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getSchedule.bind(sokujaController),
  });

  app.get('/genres', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get all genre lists',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getGenreLists.bind(sokujaController),
  });

  app.get('/anime', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get all anime lists (first page)',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getAnimeLists.bind(sokujaController),
  });

  app.get('/search', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Search anime',
      querystring: {
        type: 'object',
        properties: { q: { type: 'string' }, refresh: { type: 'string' } },
        required: ['q'],
      },
    },
    handler: sokujaController.search.bind(sokujaController),
  });

  app.get('/detail/:slug', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get anime detail by slug (info, episodes, characters)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getDetail.bind(sokujaController),
  });

  app.get('/episode/:slug', {
    schema: {
      tags: ['Sokuja'],
      summary: 'Get episode detail by slug (stream servers, downloads)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: sokujaController.getEpisode.bind(sokujaController),
  });
}
