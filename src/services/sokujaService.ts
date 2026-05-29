import { sokujaScraper } from '../scrapers/sokujaScraper';
import { parseSokujaHomepage, SokujaHomepage } from '../parsers/sokujaParser';
import { cache } from '../cache/redisCache';

export class SokujaService {
  async getHomepage(forceRefresh: boolean = false): Promise<SokujaHomepage> {
    const cacheKey = 'sokuja:homepage';
    if (!forceRefresh) {
      const cached = await cache.get<SokujaHomepage>(cacheKey);
      if (cached) return cached;
    }

    const html = await sokujaScraper.scrapeHomepage();
    const data = parseSokujaHomepage(html);

    await cache.set(cacheKey, data, 300);

    return data;
  }
}

export const sokujaService = new SokujaService();
