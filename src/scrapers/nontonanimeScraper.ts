import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

const BASE = 'https://v18.kuramanime.ing';

export class NontonanimeScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping Kuramanime homepage');
    return this.fetchWithRetry('/');
  }

  async scrapeDetail(slug: string): Promise<string> {
    const url = `/anime/${slug}`;
    logger.info({ url: BASE + url, slug }, 'Scraping anime detail');
    return this.fetchWithRetry(url);
  }

  async scrapeEpisode(path: string): Promise<string> {
    const url = path.startsWith('/') ? path : `/${path}/`;
    logger.info({ url: BASE + url }, 'Scraping episode');
    return this.fetchWithRetry(url);
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `${BASE}/anime?search=${query}`, query }, 'Scraping search');
    return this.fetchWithRetry(`/anime?search=${encodeURIComponent(query)}`);
  }

  async scrapeSearchJson(query: string): Promise<string> {
    logger.info({ url: `${BASE}/quicksearch/get?q=${query}`, query }, 'Scraping quick search JSON');
    return this.fetchWithRetry(`/quicksearch/get?q=${encodeURIComponent(query)}`);
  }

  async scrapeJadwal(): Promise<string> {
    logger.info({ url: BASE + '/schedule' }, 'Scraping jadwal rilis');
    return this.fetchWithRetry('/schedule');
  }

  async scrapePopuler(): Promise<string> {
    logger.info({ url: BASE + '/properties/season/spring-2026?order_by=most_viewed' }, 'Scraping popular');
    return this.fetchWithRetry('/properties/season/spring-2026?order_by=most_viewed');
  }

  async scrapeOngoing(): Promise<string> {
    logger.info({ url: BASE + '/quick/ongoing?order_by=text' }, 'Scraping ongoing list');
    return this.fetchWithRetry('/quick/ongoing?order_by=text');
  }

  async scrapeGenre(): Promise<string> {
    logger.info({ url: BASE + '/properties/genre' }, 'Scraping genre list');
    return this.fetchWithRetry('/properties/genre');
  }

  async scrapeGenreDetail(slug: string): Promise<string> {
    const url = `/properties/genre/${slug}`;
    logger.info({ url: BASE + url, slug }, 'Scraping genre detail');
    return this.fetchWithRetry(url);
  }
}

export const nontonanimeScraper = new NontonanimeScraper();
