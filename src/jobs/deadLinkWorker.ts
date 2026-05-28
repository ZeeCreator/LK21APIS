import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from '../config/app';
import { prisma } from '../config/database';
import { HttpClient } from '../utils/httpClient';
import { logger } from '../utils/logger';

const http = new HttpClient();

export function createDeadLinkWorker(): Worker {
  const worker = new Worker(
    queueConfig.queues.deadLinkCheck,
    async () => {
      logger.info('Dead link checker started');
      const results = { checked: 0, dead: 0, alive: 0 };

      try {
        const downloads = await prisma.download.findMany({
          take: 100,
          orderBy: { createdAt: 'desc' },
        });

        for (const download of downloads) {
          try {
            await http.get(download.url, { timeout: 10000 });
            results.alive++;
          } catch {
            results.dead++;
            await prisma.download.delete({ where: { id: download.id } });
          }
          results.checked++;
        }

        logger.info({ results }, 'Dead link check completed');
        return results;
      } catch (error) {
        logger.error({ err: error }, 'Dead link check failed');
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 2,
    }
  );

  return worker;
}
