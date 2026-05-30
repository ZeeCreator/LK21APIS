import { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { movieRoutes } from './movieRoutes';
import { seriesRoutes } from './seriesRoutes';
import { tvRoutes } from './tvRoutes';
import { searchRoutes } from './searchRoutes';
import { genreRoutes } from './genreRoutes';
import { countryRoutes } from './countryRoutes';
import { watchRoutes } from './watchRoutes';
import { downloadRoutes } from './downloadRoutes';
import { subtitleRoutes } from './subtitleRoutes';
import { adminRoutes } from './adminRoutes';
import { urlExtractRoutes } from './urlExtractRoutes';
import { testStreamRoutes } from './testStreamRoutes';
import { sokujaRoutes } from './sokujaRoutes';
import { nontonanimeRoutes } from './nontonanimeRoutes';
import { otakluRoutes } from './otakluRoutes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.register(
    async (api) => {
      await api.register(movieRoutes);
    },
    { prefix: `${env.API_PREFIX}/movies` }
  );

  app.register(
    async (api) => {
      await api.register(seriesRoutes);
    },
    { prefix: `${env.API_PREFIX}/streamtv` }
  );

  app.register(
    async (api) => {
      await api.register(tvRoutes);
    },
    { prefix: `${env.API_PREFIX}/tv` }
  );

  app.register(
    async (api) => {
      await api.register(searchRoutes);
    },
    { prefix: `${env.API_PREFIX}/search` }
  );

  app.register(
    async (api) => {
      await api.register(genreRoutes);
    },
    { prefix: `${env.API_PREFIX}/genres` }
  );

  app.register(
    async (api) => {
      await api.register(countryRoutes);
    },
    { prefix: `${env.API_PREFIX}/country` }
  );

  app.register(
    async (api) => {
      await api.register(watchRoutes);
    },
    { prefix: `${env.API_PREFIX}/watch` }
  );

  app.register(
    async (api) => {
      await api.register(downloadRoutes);
    },
    { prefix: `${env.API_PREFIX}/download` }
  );

  app.register(
    async (api) => {
      await api.register(subtitleRoutes);
    },
    { prefix: `${env.API_PREFIX}/subtitles` }
  );

  app.register(
    async (api) => {
      await api.register(adminRoutes);
    },
    { prefix: `${env.API_PREFIX}/admin` }
  );

  app.register(
    async (api) => {
      await api.register(urlExtractRoutes);
    },
    { prefix: `${env.API_PREFIX}/urlextract` }
  );

  app.register(
    async (api) => {
      await api.register(testStreamRoutes);
    },
    { prefix: `${env.API_PREFIX}/teststream` }
  );

  app.register(
    async (api) => {
      await api.register(sokujaRoutes);
    },
    { prefix: '/api/v2' }
  );

  app.register(
    async (api) => {
      await api.register(nontonanimeRoutes);
    },
    { prefix: '/api/nontonanime' }
  );

  app.register(
    async (api) => {
      await api.register(otakluRoutes);
    },
    { prefix: '/api/otaklu' }
  );
}
