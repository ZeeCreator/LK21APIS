import { FastifyInstance } from 'fastify';
import { anichinController } from '../controllers/anichinController';

export async function anichinRoutes(app: FastifyInstance): Promise<void> {
  app.get('/home', {
    schema: {
      tags: ['Anichin'],
      summary: 'Halaman utama (slider, popular today, latest release)',
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: anichinController.getHomepage.bind(anichinController),
  });

  app.get('/series/:slug', {
    schema: {
      tags: ['Anichin'],
      summary: 'Detail series donghua by slug (info, episode list, download batch)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: anichinController.getSeries.bind(anichinController),
  });

  app.get('/episode/:slug', {
    schema: {
      tags: ['Anichin'],
      summary: 'Detail episode (stream server, download, prev/next)',
      params: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      querystring: { type: 'object', properties: { refresh: { type: 'string' } } },
    },
    handler: anichinController.getEpisode.bind(anichinController),
  });

  app.get('/ongoing', {
    schema: {
      tags: ['Anichin'],
      summary: 'Daftar donghua ongoing',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          refresh: { type: 'string' },
        },
      },
    },
    handler: anichinController.getOngoing.bind(anichinController),
  });

  app.get('/completed', {
    schema: {
      tags: ['Anichin'],
      summary: 'Daftar donghua completed',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          refresh: { type: 'string' },
        },
      },
    },
    handler: anichinController.getCompleted.bind(anichinController),
  });

  app.get('/search', {
    schema: {
      tags: ['Anichin'],
      summary: 'Cari donghua',
      querystring: {
        type: 'object',
        properties: { q: { type: 'string' }, refresh: { type: 'string' } },
        required: ['q'],
      },
    },
    handler: anichinController.search.bind(anichinController),
  });
}
