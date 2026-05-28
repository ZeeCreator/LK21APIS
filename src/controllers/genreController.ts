import { FastifyRequest, FastifyReply } from 'fastify';
import { genreService } from '../services/genreService';
import { movieService } from '../services/movieService';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response';

export class GenreController {
  async getAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const genres = await genreService.getAllGenres();
      sendSuccess(reply, genres, 'Genres retrieved successfully');
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve genres');
    }
  }

  async getMovies(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getByGenre(slug, page, limit);
      sendSuccess(reply, result.data, 'Genre movies retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve genre movies');
    }
  }
}

export const genreController = new GenreController();
