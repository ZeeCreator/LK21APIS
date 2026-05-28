import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';
import { downloadScraper } from '../scrapers';
import { NotFoundError } from '../utils/errors';

export class DownloadService {
  async getDownloadLinks(slug: string) {
    const cacheKey = `download:${slug}`;
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const links = await downloadScraper.scrape(slug);
    if (!links || links.length === 0) {
      throw new NotFoundError('No download links found');
    }

    await cache.set(cacheKey, links, cacheConfig.ttl.detail);
    return links;
  }
}

export const downloadService = new DownloadService();
