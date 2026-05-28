import { Queue, JobsOptions } from 'bullmq';
import { redis, getRedisStatus } from '../config/redis';
import { queueConfig } from '../config/app';
import { logger } from '../utils/logger';

const queueInstances: Map<string, Queue> = new Map();

function createQueue(name: string): Queue | null {
  if (!getRedisStatus()) {
    logger.warn({ queue: name }, 'Queue skipped: Redis unavailable');
    return null;
  }
  try {
    const queue = new Queue(name, {
      connection: redis as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    queueInstances.set(name, queue);
    logger.info({ queue: name }, 'Queue created');
    return queue;
  } catch (error) {
    logger.warn({ queue: name, err: error }, 'Queue creation failed');
    return null;
  }
}

export const syncQueue = createQueue(queueConfig.queues.sync);
export const cacheCleanupQueue = createQueue(queueConfig.queues.cacheCleanup);
export const deadLinkCheckQueue = createQueue(queueConfig.queues.deadLinkCheck);
export const retryScraperQueue = createQueue(queueConfig.queues.retryScraper);

export async function addJob(
  queue: Queue | null,
  name: string,
  data: Record<string, unknown>,
  options?: JobsOptions
): Promise<void> {
  if (!queue) {
    logger.info({ job: name }, 'Job skipped (queue unavailable)');
    return;
  }
  try {
    await queue.add(name, data, options);
    logger.info({ queue: queue.name, job: name }, 'Job added to queue');
  } catch (error) {
    logger.warn({ queue: queue.name, job: name, err: error }, 'Failed to add job');
  }
}

export async function getQueueMetrics(queue: Queue | null) {
  if (!queue) {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  } catch {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
}
