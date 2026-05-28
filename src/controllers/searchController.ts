import { FastifyRequest, FastifyReply } from 'fastify';
import { movieService } from '../services/movieService';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response';

export class SearchController {
  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { q } = request.query as { q: string };
      if (!q || q.trim().length === 0) {
        sendError(reply, 400, 'Search query is required');
        return;
      }
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.search(q.trim(), page, limit);
      sendSuccess(reply, result.data, 'Search results retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to search movies');
    }
  }
}

export const searchController = new SearchController();
