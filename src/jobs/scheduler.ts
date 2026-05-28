import cron from 'node-cron';
import { getRedisStatus } from '../config/redis';
import { syncQueue, cacheCleanupQueue, deadLinkCheckQueue, addJob } from './queue';
import { logger } from '../utils/logger';

export function startScheduler(): void {
  if (getRedisStatus()) {
    try {
      const { createSyncWorker } = require('./syncWorker');
      const { createCacheCleanupWorker } = require('./cacheCleanupWorker');
      const { createDeadLinkWorker } = require('./deadLinkWorker');
      const { createRetryScraperWorker } = require('./retryScraperWorker');
      createSyncWorker();
      createCacheCleanupWorker();
      createDeadLinkWorker();
      createRetryScraperWorker();
    } catch (error) {
      logger.warn({ err: error }, 'Some workers failed to start');
    }
  } else {
    logger.info('Scheduler: Redis unavailable, workers not started');
  }

  cron.schedule('0 */6 * * *', async () => {
    logger.info('Scheduler: Starting auto sync');
    await addJob(syncQueue, 'auto-sync', { type: 'latest' });
  });

  cron.schedule('0 * * * *', async () => {
    logger.info('Scheduler: Starting cache cleanup');
    await addJob(cacheCleanupQueue, 'cache-cleanup', {});
  });

  cron.schedule('0 */12 * * *', async () => {
    logger.info('Scheduler: Starting dead link check');
    await addJob(deadLinkCheckQueue, 'dead-link-check', {});
  });

  logger.info('Job scheduler started');
}

export async function stopScheduler(): Promise<void> {
  try {
    const { Worker } = require('bullmq');
    const workers = Worker.Workers || [];
    for (const worker of workers) {
      await worker.close();
    }
  } catch {
    // ignore
  }
  logger.info('Job scheduler stopped');
}
