import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from '../config/app';
import { cache } from '../cache/redisCache';
import { logger } from '../utils/logger';

export function createCacheCleanupWorker(): Worker {
  const worker = new Worker(
    queueConfig.queues.cacheCleanup,
    async () => {
      logger.info('Cache cleanup worker started');
      try {
        await cache.flush();
        logger.info('Cache cleaned up successfully');
        return { cleaned: true };
      } catch (error) {
        logger.error({ err: error }, 'Cache cleanup failed');
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 1,
    }
  );

  worker.on('completed', () => {
    logger.info('Cache cleanup job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, err: error }, 'Cache cleanup job failed');
  });

  return worker;
}
