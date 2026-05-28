import { FastifyRequest, FastifyReply } from 'fastify';
import { downloadService } from '../services/downloadService';
import { sendSuccess, sendError } from '../utils/response';

export class DownloadController {
  async getLinks(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const links = await downloadService.getDownloadLinks(slug);
      sendSuccess(reply, links, 'Download links retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'No download links found');
      } else {
        sendError(reply, 500, 'Failed to retrieve download links');
      }
    }
  }
}

export const downloadController = new DownloadController();
