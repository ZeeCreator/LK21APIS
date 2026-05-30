import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

const BASE = 'https://otakudesu.blog';

export class NontonanimeScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping OtakuDesu homepage');
    return this.fetchWithRetry('/');
  }

  async scrapeDetail(slug: string): Promise<string> {
    const url = `/anime/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping anime detail');
    return this.fetchWithRetry(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/episode/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode');
    return this.fetchWithRetry(url);
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `${BASE}/?s=${query}&post_type=anime`, query }, 'Scraping search');
    return this.fetchWithRetry(`/?s=${encodeURIComponent(query)}&post_type=anime`);
  }

  async scrapeJadwal(): Promise<string> {
    logger.info({ url: BASE + '/jadwal-rilis/' }, 'Scraping jadwal rilis');
    return this.fetchWithRetry('/jadwal-rilis/');
  }

  async scrapePopuler(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping popular (homepage ongoing)');
    return this.fetchWithRetry('/');
  }

  async scrapeOngoing(): Promise<string> {
    logger.info({ url: BASE + '/ongoing-anime/' }, 'Scraping ongoing list');
    return this.fetchWithRetry('/ongoing-anime/');
  }

  async scrapeGenre(): Promise<string> {
    logger.info({ url: BASE + '/genre-list/' }, 'Scraping genre list');
    return this.fetchWithRetry('/genre-list/');
  }

  async scrapeGenreDetail(slug: string): Promise<string> {
    const url = `/genres/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping genre detail');
    return this.fetchWithRetry(url);
  }
}

export const nontonanimeScraper = new NontonanimeScraper();
