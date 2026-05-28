import { FastifyRequest, FastifyReply } from 'fastify';
import { countryService } from '../services/countryService';
import { movieService } from '../services/movieService';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response';

export class CountryController {
  async getAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const countries = await countryService.getAllCountries();
      sendSuccess(reply, countries, 'Countries retrieved successfully');
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve countries');
    }
  }

  async getMovies(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const { page, limit } = getPaginationParams(request.query as any);
      const result = await movieService.getByCountry(slug, page, limit);
      sendSuccess(reply, result.data, 'Country movies retrieved successfully', 200, result.meta);
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve country movies');
    }
  }
}

export const countryController = new CountryController();
