import { sokujaScraper } from '../scrapers/sokujaScraper';
import {
  parseSokujaHomepage, parseSokujaSchedule, parseSokujaGenreLists,
  parseSokujaAnimeLists, parseSokujaSearch,
  SokujaHomepage, SokujaSchedule, SokujaGenreItem, SokujaAnimeItem, SokujaSearchResult,
} from '../parsers/sokujaParser';
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

  async getSchedule(forceRefresh: boolean = false): Promise<SokujaSchedule> {
    const cacheKey = 'sokuja:schedule';
    if (!forceRefresh) {
      const cached = await cache.get<SokujaSchedule>(cacheKey);
      if (cached) return cached;
    }
    const html = await sokujaScraper.scrapeSchedule();
    const data = parseSokujaSchedule(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getGenreLists(forceRefresh: boolean = false): Promise<SokujaGenreItem[]> {
    const cacheKey = 'sokuja:genres';
    if (!forceRefresh) {
      const cached = await cache.get<SokujaGenreItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await sokujaScraper.scrapeGenreLists();
    const data = parseSokujaGenreLists(html);
    await cache.set(cacheKey, data, 3600);
    return data;
  }

  async getAnimeLists(forceRefresh: boolean = false): Promise<SokujaAnimeItem[]> {
    const cacheKey = 'sokuja:anime';
    if (!forceRefresh) {
      const cached = await cache.get<SokujaAnimeItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await sokujaScraper.scrapeAnimeLists();
    const data = parseSokujaAnimeLists(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async search(query: string, forceRefresh: boolean = false): Promise<SokujaSearchResult> {
    const cacheKey = `sokuja:search:${query}`;
    if (!forceRefresh) {
      const cached = await cache.get<SokujaSearchResult>(cacheKey);
      if (cached) return cached;
    }
    const html = await sokujaScraper.scrapeSearch(query);
    const data = parseSokujaSearch(html, query);
    await cache.set(cacheKey, data, 300);
    return data;
  }
}

export const sokujaService = new SokujaService();
