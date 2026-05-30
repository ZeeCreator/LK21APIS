import { FastifyInstance } from 'fastify';
import { nontonanimeController } from '../controllers/nontonanimeController';

export async function otakluRoutes(app: FastifyInstance): Promise<void> {
  app.get('/home', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get homepage (latest episodes, ongoing, completed)',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getHomepage.bind(nontonanimeController),
  });

  app.get('/detail/:slug', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get anime detail by slug (info, episodes, recommendations)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getDetail.bind(nontonanimeController),
  });

  app.get('/watch/:slug', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get episode detail by slug (stream, downloads)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getEpisode.bind(nontonanimeController),
  });

  app.get('/search', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Search anime',
      querystring: {
        type: 'object',
        properties: { q: { type: 'string' }, refresh: { type: 'string' } },
        required: ['q'],
      },
    },
    handler: nontonanimeController.search.bind(nontonanimeController),
  });

  app.get('/jadwal', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get release schedule by day',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getJadwal.bind(nontonanimeController),
  });

  app.get('/populer', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get popular series list',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getPopuler.bind(nontonanimeController),
  });

  app.get('/ongoing', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get ongoing anime list',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getOngoing.bind(nontonanimeController),
  });

  app.get('/genre', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get all genre lists',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getGenre.bind(nontonanimeController),
  });

  app.get('/genre-detail/:slug', {
    schema: {
      tags: ['Otaklu'],
      summary: 'Get anime list by genre slug',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: nontonanimeController.getGenreDetail.bind(nontonanimeController),
  });
}
