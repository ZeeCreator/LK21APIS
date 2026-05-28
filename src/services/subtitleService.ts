import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';
import { subtitleScraper } from '../scrapers';
import { NotFoundError } from '../utils/errors';

export class SubtitleService {
  async getSubtitles(slug: string) {
    const cacheKey = `subtitle:${slug}`;
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const subtitles = await subtitleScraper.scrape(slug);
    if (!subtitles || subtitles.length === 0) {
      throw new NotFoundError('No subtitles found');
    }

    await cache.set(cacheKey, subtitles, cacheConfig.ttl.detail);
    return subtitles;
  }
}

export const subtitleService = new SubtitleService();
