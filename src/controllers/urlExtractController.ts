import { FastifyRequest, FastifyReply } from 'fastify';
import { urlExtractService } from '../services/urlExtractService';
import { sendSuccess, sendError } from '../utils/response';

export class UrlExtractController {
  async extract(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { url } = request.body as { url: string };
      if (!url) {
        sendError(reply, 400, 'url is required');
        return;
      }
      const result = await urlExtractService.extract(url);
      sendSuccess(reply, result, 'Stream URL extracted successfully');
    } catch (error) {
      sendError(reply, 500, 'Failed to extract stream URL');
    }
  }
}

export const urlExtractController = new UrlExtractController();
