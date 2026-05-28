import { FastifyInstance } from 'fastify';
import { adminController } from '../controllers/adminController';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.post('/sync', {
    schema: {
      tags: ['Admin'],
      summary: 'Sync movies from source',
      body: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['latest', 'trending', 'all'] },
        },
      },
    },
    handler: adminController.sync.bind(adminController),
  });

  app.get('/stats', {
    schema: {
      tags: ['Admin'],
      summary: 'Get system statistics',
    },
    handler: adminController.stats.bind(adminController),
  });
}
