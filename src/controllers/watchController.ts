import { FastifyRequest, FastifyReply } from 'fastify';
import { watchService } from '../services/watchService';
import { sendSuccess, sendError } from '../utils/response';

export class WatchController {
  async getSources(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const { resolve: resolveParam } = request.query as { resolve?: string };
      const resolveStreams = resolveParam === 'true';
      const sources = await watchService.getWatchSources(slug, resolveStreams);
      sendSuccess(reply, sources, 'Watch sources retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'No watch sources found');
      } else {
        sendError(reply, 500, 'Failed to retrieve watch sources');
      }
    }
  }
}

export const watchController = new WatchController();
