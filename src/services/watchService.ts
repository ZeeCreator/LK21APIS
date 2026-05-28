import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';
import { watchScraper } from '../scrapers';
import { NotFoundError } from '../utils/errors';

export class WatchService {
  async getWatchSources(slug: string, resolveStreams = false) {
    const cacheKey = `watch:${slug}${resolveStreams ? ':resolved' : ''}`;
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const sources = await watchScraper.scrape(slug, resolveStreams);
    if (!sources || sources.length === 0) {
      throw new NotFoundError('No watch sources found');
    }

    await cache.set(cacheKey, sources, cacheConfig.ttl.detail);
    return sources;
  }
}

export const watchService = new WatchService();
