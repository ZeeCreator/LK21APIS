import { FastifyRequest, FastifyReply } from 'fastify';
import { movieService } from '../services/movieService';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response';

export class MovieController {
  async getLatest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getLatest(page, limit);
      sendSuccess(reply, result.data, 'Latest movies retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve latest movies');
    }
  }

  async getTrending(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getTrending(page, limit);
      sendSuccess(reply, result.data, 'Trending movies retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve trending movies');
    }
  }

  async getDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const movie = await movieService.getDetail(slug);
      sendSuccess(reply, movie, 'Movie detail retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'Movie not found');
      } else {
        sendError(reply, 500, 'Failed to retrieve movie detail');
      }
    }
  }

  async getRebahin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getRebahin(page, limit);
      sendSuccess(reply, result.data, 'Rebahin movies retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve rebahin movies');
    }
  }

  async getSeries(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getSeries(page, limit);
      sendSuccess(reply, result.data, 'Series retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve series');
    }
  }
}

export const movieController = new MovieController();
