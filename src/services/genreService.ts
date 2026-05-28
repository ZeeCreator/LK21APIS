import { genreScraper } from '../scrapers';
import { prisma, getDatabaseStatus } from '../config/database';
import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';

export class GenreService {
  async getAllGenres() {
    const cacheKey = 'genres:all';
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) return cached;

    if (getDatabaseStatus()) {
      try {
        const genres = await prisma.genre.findMany({
          distinct: ['name'],
          select: { name: true, slug: true },
        });
        if (genres.length > 0) {
          await cache.set(cacheKey, genres, cacheConfig.ttl.latest);
          return genres;
        }
      } catch {
        // fallback
      }
    }

    const scraped = await genreScraper.scrapeGenres();
    const result = scraped.map((g) => ({ name: g.name, slug: g.slug }));
    await cache.set(cacheKey, result, cacheConfig.ttl.latest);
    return result;
  }
}

export const genreService = new GenreService();
