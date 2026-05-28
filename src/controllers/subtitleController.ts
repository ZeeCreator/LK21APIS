import { FastifyRequest, FastifyReply } from 'fastify';
import { subtitleService } from '../services/subtitleService';
import { sendSuccess, sendError } from '../utils/response';

export class SubtitleController {
  async getSubtitles(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const subtitles = await subtitleService.getSubtitles(slug);
      sendSuccess(reply, subtitles, 'Subtitles retrieved successfully');
    } catch (error) {
      if ((error as any).code === 404) {
        sendError(reply, 404, 'No subtitles found');
      } else {
        sendError(reply, 500, 'Failed to retrieve subtitles');
      }
    }
  }
}

export const subtitleController = new SubtitleController();
