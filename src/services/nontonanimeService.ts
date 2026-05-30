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
  private async getHentaiSlugSet(forceRefresh: boolean = false): Promise<Set<string>> {
    const cacheKey = 'nontonanime:hentai:slugs';
    if (!forceRefresh) {
      const cached = await cache.get<string[]>(cacheKey);
      if (cached) return new Set(cached);
    }
    const html = await nontonanimeScraper.scrapeGenreDetail('hentong');
    const parsed = parseNontonanimeGenreDetail(html, 'hentong');
    const slugs = parsed.items.map(i => i.slug);
    await cache.set(cacheKey, slugs, 3600);
    return new Set(slugs);
  }

  private filterHentai<T extends { slug: string }>(items: T[], hentaiSet: Set<string>): T[] {
    return items.filter(i => !hentaiSet.has(i.slug));
  }

  async getHomepage(forceRefresh: boolean = false): Promise<NontonanimeHomepage> {
    const cacheKey = 'nontonanime:homepage';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeHomepage>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeHomepage();
    const data = parseNontonanimeHomepage(html);
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    data.latestEpisodes = this.filterHentai(data.latestEpisodes, hentai);
    data.movie = this.filterHentai(data.movie, hentai);
    data.tv = this.filterHentai(data.tv, hentai);
    data.popular = this.filterHentai(data.popular, hentai);
    data.popularGenre = this.filterHentai(data.popularGenre, hentai);
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
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    data.recommendations = this.filterHentai(data.recommendations, hentai);
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
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    data.items = this.filterHentai(data.items, hentai);
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
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    for (const day of data) {
      day.items = this.filterHentai(day.items, hentai);
    }
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
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    const filtered = this.filterHentai(data, hentai);
    await cache.set(cacheKey, filtered, 600);
    return filtered;
  }

  async getOngoing(forceRefresh: boolean = false): Promise<NontonanimeAnimeItem[]> {
    const cacheKey = 'nontonanime:ongoing';
    if (!forceRefresh) {
      const cached = await cache.get<NontonanimeAnimeItem[]>(cacheKey);
      if (cached) return cached;
    }
    const html = await nontonanimeScraper.scrapeOngoing();
    const data = parseNontonanimeOngoing(html);
    const hentai = await this.getHentaiSlugSet(forceRefresh);
    const filtered = this.filterHentai(data, hentai);
    await cache.set(cacheKey, filtered, 600);
    return filtered;
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
    if (slug !== 'hentong') {
      const hentai = await this.getHentaiSlugSet(forceRefresh);
      data.items = this.filterHentai(data.items, hentai);
    }
    await cache.set(cacheKey, data, 600);
    return data;
  }

  async getHentai(forceRefresh: boolean = false): Promise<{ genre: string; items: any[] }> {
    return this.getGenreDetail('hentong', forceRefresh);
  }
}

export const nontonanimeService = new NontonanimeService();
