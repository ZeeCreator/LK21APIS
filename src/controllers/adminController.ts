import { FastifyRequest, FastifyReply } from 'fastify';
import { adminService } from '../services/adminService';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  async sync(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { type } = request.body as { type: 'latest' | 'trending' | 'all' };
      const result = await adminService.syncMovies(type);
      sendSuccess(reply, result, 'Sync completed successfully');
    } catch (error) {
      sendError(reply, 500, 'Sync failed');
    }
  }

  async stats(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const stats = await adminService.getStats();
      sendSuccess(reply, stats, 'Stats retrieved successfully');
    } catch (error) {
      sendError(reply, 500, 'Failed to retrieve stats');
    }
  }
}

export const adminController = new AdminController();
