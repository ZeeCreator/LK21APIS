import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from '../config/app';
import { adminService } from '../services/adminService';
import { logger } from '../utils/logger';

export function createSyncWorker(): Worker {
  const worker = new Worker(
    queueConfig.queues.sync,
    async (job) => {
      const { type } = job.data as { type: 'latest' | 'trending' | 'all' };
      logger.info({ jobId: job.id, type }, 'Sync worker started');

      try {
        const result = await adminService.syncMovies(type);
        logger.info({ jobId: job.id, result }, 'Sync worker completed');
        return result;
      } catch (error) {
        logger.error({ jobId: job.id, err: error }, 'Sync worker failed');
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: queueConfig.concurrency,
      limiter: {
        max: 1,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Sync job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, err: error }, 'Sync job failed');
  });

  logger.info('Sync worker created');
  return worker;
}
