import { countryScraper } from '../scrapers';
import { prisma, getDatabaseStatus } from '../config/database';
import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';

export class CountryService {
  async getAllCountries() {
    const cacheKey = 'countries:all';
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) return cached;

    if (getDatabaseStatus()) {
      try {
        const countries = await prisma.movie.findMany({
          where: { country: { not: null } },
          distinct: ['country'],
          select: { country: true },
        });
        if (countries.length > 0) {
          const result = countries
            .filter((c) => c.country)
            .map((c) => ({ name: c.country!, slug: c.country!.toLowerCase().replace(/\s+/g, '-') }));
          await cache.set(cacheKey, result, cacheConfig.ttl.latest);
          return result;
        }
      } catch {
        // fallback
      }
    }

    const scraped = await countryScraper.scrapeCountries();
    const result = scraped.map((c) => ({ name: c.name, slug: c.slug }));
    await cache.set(cacheKey, result, cacheConfig.ttl.latest);
    return result;
  }
}

export const countryService = new CountryService();
