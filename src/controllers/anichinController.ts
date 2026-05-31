import { FastifyRequest, FastifyReply } from 'fastify';
import { anichinService } from '../services/anichinService';
import { sendSuccess, sendError } from '../utils/response';

export class AnichinController {
  async getHomepage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await anichinService.getHomepage(forceRefresh);
      sendSuccess(reply, data, 'Homepage Anichin berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mengambil homepage: ${msg}`);
    }
  }

  async getSeries(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await anichinService.getSeries(slug, forceRefresh);
      if (!data.title) {
        sendError(reply, 404, 'Series tidak ditemukan');
        return;
      }
      sendSuccess(reply, data, 'Detail series berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mengambil detail series: ${msg}`);
    }
  }

  async getEpisode(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { slug } = request.params as { slug: string };
      const forceRefresh = (request.query as any)?.refresh === 'true';
      const data = await anichinService.getEpisode(slug, forceRefresh);
      if (!data.title) {
        sendError(reply, 404, 'Episode tidak ditemukan');
        return;
      }
      sendSuccess(reply, data, 'Detail episode berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mengambil detail episode: ${msg}`);
    }
  }

  async getOngoing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = request.query as { page?: string; refresh?: string };
      const page = Math.max(1, parseInt(query.page || '1', 10));
      const forceRefresh = query.refresh === 'true';
      const data = await anichinService.getOngoing(page, forceRefresh);
      sendSuccess(reply, data, 'Daftar ongoing berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mengambil ongoing: ${msg}`);
    }
  }

  async getCompleted(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = request.query as { page?: string; refresh?: string };
      const page = Math.max(1, parseInt(query.page || '1', 10));
      const forceRefresh = query.refresh === 'true';
      const data = await anichinService.getCompleted(page, forceRefresh);
      sendSuccess(reply, data, 'Daftar completed berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mengambil completed: ${msg}`);
    }
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { q, refresh } = request.query as { q?: string; refresh?: string };
      if (!q || !q.trim()) {
        sendError(reply, 400, 'Parameter "q" wajib diisi');
        return;
      }
      const forceRefresh = refresh === 'true';
      const data = await anichinService.search(q.trim(), forceRefresh);
      sendSuccess(reply, data, 'Hasil pencarian berhasil diambil');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sendError(reply, 500, `Gagal mencari: ${msg}`);
    }
  }
}

export const anichinController = new AnichinController();
