import { FastifyRequest, FastifyReply } from 'fastify';
import { watchService } from '../services/watchService';
import { movieService } from '../services/movieService';
import { sendSuccess, sendError } from '../utils/response';

export class TvController {
  async getStream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const { resolve: resolveParam } = request.query as { resolve?: string };
      const resolveStreams = resolveParam === 'true';
      const sources = await watchService.getWatchSources(slug, resolveStreams);
      sendSuccess(reply, sources, 'Stream sources retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'No stream sources found');
      } else {
        sendError(reply, 500, 'Failed to retrieve stream sources');
      }
    }
  }

  async getDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const movie = await movieService.getDetail(slug);
      sendSuccess(reply, movie, 'TV series detail retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'TV series not found');
      } else {
        sendError(reply, 500, 'Failed to retrieve TV series detail');
      }
    }
  }
}

export const tvController = new TvController();
