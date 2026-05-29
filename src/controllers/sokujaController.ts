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
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Failed to retrieve Sokuja homepage data: ${msg}`);
    }
  }
}

export const sokujaController = new SokujaController();
