import { FastifyRequest, FastifyReply } from 'fastify';
import { sokujaService } from '../services/sokujaService';
import { sendSuccess, sendError } from '../utils/response';

export class SokujaController {
  async getHomepage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await sokujaService.getHomepage(forceRefresh);
      sendSuccess(reply, data, 'Sokuja homepage data retrieved successfully');
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve Sokuja homepage data');
    }
  }
}

export const sokujaController = new SokujaController();
