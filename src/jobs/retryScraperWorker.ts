import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from '../config/app';
import { detailScraper } from '../scrapers';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export function createRetryScraperWorker(): Worker {
  const worker = new Worker(
    queueConfig.queues.retryScraper,
    async (job) => {
      const { slug } = job.data as { slug: string };
      logger.info({ jobId: job.id, slug }, 'Retry scraper started');

      try {
        const detail = await detailScraper.scrape(slug);
        await prisma.movie.upsert({
          where: { slug },
          update: {
            title: detail.title,
            description: detail.description,
            posterUrl: detail.posterUrl,
            year: detail.year,
            rating: detail.rating,
            duration: detail.duration,
            quality: detail.quality,
          },
          create: {
            externalId: detail.externalId,
            title: detail.title,
            slug: detail.slug,
            description: detail.description,
            posterUrl: detail.posterUrl,
            year: detail.year,
            rating: detail.rating,
          },
        });
        logger.info({ slug }, 'Retry scraper completed');
        return { slug, synced: true };
      } catch (error) {
        logger.error({ slug, err: error }, 'Retry scraper failed');
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 3,
    }
  );

  return worker;
}
