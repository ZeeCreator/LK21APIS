import { prisma, getDatabaseStatus } from '../config/database';
import { cache } from '../cache/redisCache';
import { latestScraper, detailScraper } from '../scrapers';
import { logger } from '../utils/logger';

export class AdminService {
  async syncMovies(type: 'latest' | 'trending' | 'all') {
    logger.info({ type }, 'Starting movie sync');
    const results = { synced: 0, failed: 0, errors: [] as string[] };

    try {
      const movies = await latestScraper.scrape(1);

      for (const movie of movies) {
        try {
          const detail = await detailScraper.scrape(movie.slug);
          results.synced++;

          if (getDatabaseStatus()) {
            try {
              await prisma.movie.upsert({
                where: { slug: movie.slug },
                create: {
                  externalId: detail.externalId,
                  title: detail.title,
                  slug: detail.slug,
                  titleEn: detail.titleEn,
                  description: detail.description,
                  posterUrl: detail.posterUrl,
                  backdropUrl: detail.backdropUrl,
                  year: detail.year,
                  rating: detail.rating,
                  duration: detail.duration,
                  quality: detail.quality,
                  status: detail.status,
                  country: detail.country,
                  isLatest: type === 'latest' || type === 'all',
                  isTrending: type === 'trending' || false,
                },
                update: {
                  title: detail.title,
                  titleEn: detail.titleEn,
                  description: detail.description,
                  posterUrl: detail.posterUrl,
                  backdropUrl: detail.backdropUrl,
                  year: detail.year,
                  rating: detail.rating,
                  duration: detail.duration,
                  quality: detail.quality,
                  status: detail.status,
                  country: detail.country,
                  isLatest: type === 'latest' || type === 'all' ? true : undefined,
                  isTrending: type === 'trending' ? true : undefined,
                },
              });

              if (detail.genres.length > 0) {
                const dbMovie = await prisma.movie.findUnique({ where: { slug: movie.slug } });
                if (dbMovie) {
                  await prisma.genre.deleteMany({ where: { movieId: dbMovie.id } });
                  await prisma.genre.createMany({
                    data: detail.genres.map((g) => ({
                      name: g,
                      slug: g.toLowerCase().replace(/\s+/g, '-'),
                      movieId: dbMovie.id,
                    })),
                  });
                }
              }
            } catch (dbError) {
              logger.warn({ slug: movie.slug, err: dbError }, 'DB sync failed, data scraped only');
            }
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to sync ${movie.slug}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      logger.error({ err: error }, 'Sync failed');
      throw error;
    }

    await cache.flush();
    logger.info({ results }, 'Movie sync completed');
    return results;
  }

  async getStats() {
    if (!getDatabaseStatus()) {
      return { totalMovies: 0, totalGenres: 0, latestMovies: 0, trendingMovies: 0 };
    }

    try {
      const [totalMovies, totalGenres] = await Promise.all([
        prisma.movie.count(),
        prisma.genre.count(),
      ]);

      return {
        totalMovies,
        totalGenres,
        latestMovies: await prisma.movie.count({ where: { isLatest: true } }),
        trendingMovies: await prisma.movie.count({ where: { isTrending: true } }),
      };
    } catch {
      return { totalMovies: 0, totalGenres: 0, latestMovies: 0, trendingMovies: 0 };
    }
  }
}

export const adminService = new AdminService();
