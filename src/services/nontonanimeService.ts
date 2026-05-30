import { nontonanimeScraper } from '../scrapers/nontonanimeScraper';
import {
  parseNontonanimeHomepage, parseNontonanimeAnimeDetail,
  parseNontonanimeSearch, parseNontonanimeJadwal,
  parseNontonanimePopuler, parseNontonanimeOngoing,
  parseNontonanimeGenre, parseNontonanimeGenreDetail,
  parseNontonanimeEpisode,
  NontonanimeHomepage, NontonanimeAnimeDetail,
  NontonanimeSearchResult, NontonanimeJadwalDay,
  NontonanimePopulerItem, NontonanimeAnimeItem,
  NontonanimeGenreItem, NontonanimeEpisodeDetail,
} from '../parsers/nontonanimeParser';
import { cache } from '../cache/redisCache';

export class NontonanimeService {
  async getHomepage(forceRefresh: boolean = false): Promise<NontonanimeHomepage> {
    const cacheKey = 'nontonanime:homepage';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeHomepage>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeHomepage();
    const data = parseNontonanimeHomepage(html);
    await cache.set(cacheKey, data, 300);
    return data;
  }

  async getDetail(slug: string, forceRefresh: boolean = false): Promise<NontonanimeAnimeDetail> {
    const cacheKey = `nontonanime:detail:${slug}`;
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeAnimeDetail>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeDetail(slug);
    const data = parseNontonanimeAnimeDetail(html, slug);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getEpisode(slug: string, forceRefresh: boolean = false): Promise<NontonanimeEpisodeDetail> {
    const cacheKey = `nontonanime:episode:${slug}`;
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeEpisodeDetail>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeEpisode(slug);
    const data = parseNontonanimeEpisode(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async search(query: string, forceRefresh: boolean = false): Promise<NontonanimeSearchResult> {
    const cacheKey = `nontonanime:search:${query}`;
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeSearchResult>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeSearch(query);
    const data = parseNontonanimeSearch(html, query);
    await cache.set(cacheKey, data, 300);
    return data;
  }

  async getJadwal(forceRefresh: boolean = false): Promise<NontonanimeJadwalDay[]> {
    const cacheKey = 'nontonanime:jadwal';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeJadwalDay[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeJadwal();
    const data = parseNontonanimeJadwal(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getPopuler(forceRefresh: boolean = false): Promise<NontonanimePopulerItem[]> {
    const cacheKey = 'nontonanime:populer';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimePopulerItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapePopuler();
    const data = parseNontonanimePopuler(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getOngoing(forceRefresh: boolean = false): Promise<NontonanimeAnimeItem[]> {
    const cacheKey = 'nontonanime:ongoing';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeAnimeItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeOngoing();
    const data = parseNontonanimeOngoing(html);
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getGenre(forceRefresh: boolean = false): Promise<NontonanimeGenreItem[]> {
    const cacheKey = 'nontonanime:genre';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeGenreItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeGenre();
    const data = parseNontonanimeGenre(html);
    await cache.set(cacheKey, data, 3600);
    return data;
  }

  async getGenreDetail(slug: string, forceRefresh: boolean = false): Promise<{ genre: string; items: any[] }> {
    const cacheKey = `nontonanime:genre-detail:${slug}`;
    if (!forceRefresh) {
      const cached = await cache.get<{ genre: string; items: any[] }>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeGenreDetail(slug);
    const data = parseNontonanimeGenreDetail(html, slug);
    await cache.set(cacheKey, data, 600);
    return data;
  }
}

export const nontonanimeService = new NontonanimeService();
