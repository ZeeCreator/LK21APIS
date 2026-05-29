import { FastifyRequest, FastifyReply } from 'fastify';
import { sokujaService } from '../services/sokujaService';
import { sendSuccess, sendError } from '../utils/response';

export class SokujaController {
  async getHomepage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getHomepage(forceRefresh);
      sendSuccess(reply, data, 'Homepage data retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve homepage: ${msg}`);
    }
  }

  async getSchedule(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getSchedule(forceRefresh);
      sendSuccess(reply, data, 'Schedule retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve schedule: ${msg}`);
    }
  }

  async getGenreLists(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getGenreLists(forceRefresh);
      sendSuccess(reply, data, 'Genre lists retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve genre lists: ${msg}`);
    }
  }

  async getAnimeLists(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getAnimeLists(forceRefresh);
      sendSuccess(reply, data, 'Anime lists retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve anime lists: ${msg}`);
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
      const data = await sokujaService.search(q.trim(), forceRefresh);
      sendSuccess(reply, data, 'Search results retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to search: ${msg}`);
    }
  }

  async getDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getDetail(slug, forceRefresh);
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
      const data = await sokujaService.getEpisode(slug, forceRefresh);
      if (!data.title) {
        sendError(reply, 404, 'Episode not found');
        return;
      }
      sendSuccess(reply, data, 'Episode detail retrieved successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve episode: ${msg}`);
    }
  }
}

export const sokujaController = new SokujaController();
