import { FastifyRequest, FastifyReply } from 'fastify';
import { nontonanimeService } from '../services/nontonanimeService';
import { sendSuccess, sendError } from '../utils/response';

export class NontonanimeController {
  async getHomepage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getHomepage(forceRefresh);
      sendSuccess(reply, data, 'Homepage retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve homepage: ${msg}`);
    }
  }

  async getDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getDetail(slug, forceRefresh);
      if (!data.title) {
        sendError(reply, 404, 'Anime not found');
        return;
      }
      sendSuccess(reply, data, 'Anime detail retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve anime detail: ${msg}`);
    }
  }

  async getEpisode(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getEpisode(slug, forceRefresh);
      if (!data.title) {
        sendError(reply, 404, 'Episode not found');
        return;
      }
      sendSuccess(reply, data, 'Episode retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve episode: ${msg}`);
    }
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { q, refresh } = request.query as { q?: string; refresh?: string };
      if (!q || !q.trim()) {
        sendError(reply, 400, 'Query parameter "q" is required');
        return;
      }
      const forceRefresh = refresh === 'true';
      const data = await nontonanimeService.search(q.trim(), forceRefresh);
      sendSuccess(reply, data, 'Search results retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to search: ${msg}`);
    }
  }

  async getJadwal(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getJadwal(forceRefresh);
      sendSuccess(reply, data, 'Jadwal rilis retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve jadwal: ${msg}`);
    }
  }

  async getPopuler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getPopuler(forceRefresh);
      sendSuccess(reply, data, 'Popular series retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve popular series: ${msg}`);
    }
  }

  async getOngoing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getOngoing(forceRefresh);
      sendSuccess(reply, data, 'Ongoing list retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve ongoing list: ${msg}`);
    }
  }

  async getGenre(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getGenre(forceRefresh);
      sendSuccess(reply, data, 'Genre list retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve genre list: ${msg}`);
    }
  }

  async getGenreDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await nontonanimeService.getGenreDetail(slug, forceRefresh);
      sendSuccess(reply, data, 'Genre detail retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve genre detail: ${msg}`);
    }
  }
}

export const nontonanimeController = new NontonanimeController();
