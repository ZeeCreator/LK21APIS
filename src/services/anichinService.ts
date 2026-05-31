import { anichinScraper } from '../scrapers/anichinScraper';
import {
  parseAnichinHomepage,
  parseAnichinSeriesDetail,
  parseAnichinEpisode,
  parseAnichinSeriesList,
  parseAnichinSearch,
  AnichinHomepage,
  AnichinSeriesDetail,
  AnichinEpisodeDetail,
  AnichinSeriesList,
  AnichinSearchResult,
} from '../parsers/anichinParser';
import { cache } from '../cache/redisCache';

export class AnichinService {
  async getHomepage(forceRefresh: boolean = false): Promise<AnichinHomepage> {
    const cacheKey = 'anichin:homepage';
    if (!forceRefresh) {
      const cached = await cache.get<AnichinHomepage>(cacheKey);
      if (cached) return cached;
    }
    const html = await anichinScraper.scrapeHomepage();
    const data = parseAnichinHomepage(html);
    await cache.set(cacheKey, data, 300);
    return data;
  }

  async getSeries(slug: string, forceRefresh: boolean = false): Promise<AnichinSeriesDetail> {
    const cacheKey = `anichin:series:${slug}`;
    if (!forceRefresh) {
      const cached = await cache.get<AnichinSeriesDetail>(cacheKey);
      if (cached) return cached;
    }
    const html = await anichinScraper.scrapeSeries(slug);
    const data = parseAnichinSeriesDetail(html, slug);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getEpisode(slug: string, forceRefresh: boolean = false): Promise<AnichinEpisodeDetail> {
    const cacheKey = `anichin:episode:${slug}`;
    if (!forceRefresh) {
      const cached = await cache.get<AnichinEpisodeDetail>(cacheKey);
      if (cached) return cached;
    }
    const html = await anichinScraper.scrapeEpisode(slug);
    const data = parseAnichinEpisode(html, slug);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getLatest(page: number = 1, forceRefresh: boolean = false): Promise<AnichinSeriesList> {
    const cacheKey = `anichin:latest:${page}`;
    if (!forceRefresh) {
      const cached = await cache.get<AnichinSeriesList>(cacheKey);
      if (cached) return cached;
    }
    const html = await anichinScraper.scrapeLatest(page);
    const data = parseAnichinSeriesList(html, 'Latest');
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async search(query: string, forceRefresh: boolean = false): Promise<AnichinSearchResult> {
    const cacheKey = `anichin:search:${query}`;
    if (!forceRefresh) {
      const cached = await cache.get<AnichinSearchResult>(cacheKey);
      if (cached) return cached;
    }
    const html = await anichinScraper.scrapeSearch(query);
    const data = parseAnichinSearch(html, query);
    await cache.set(cacheKey, data, 300);
    return data;
  }
}

export const anichinService = new AnichinService();
