import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

export class SokujaScraper extends BaseScraper {
  constructor() {
    super('https://nekokun.my.id');
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: 'https://nekokun.my.id/' }, 'Scraping Sokuja homepage');
    return this.fetchWithRetry('/');
  }

  async scrapeSchedule(): Promise<string> {
    logger.info({ url: 'https://nekokun.my.id/schedule/' }, 'Scraping schedule');
    return this.fetchWithRetry('/schedule/');
  }

  async scrapeGenreLists(): Promise<string> {
    logger.info({ url: 'https://nekokun.my.id/genre-lists/' }, 'Scraping genre lists');
    return this.fetchWithRetry('/genre-lists/');
  }

  async scrapeAnimeLists(): Promise<string> {
    logger.info({ url: 'https://nekokun.my.id/anime-lists/' }, 'Scraping anime lists');
    return this.fetchWithRetry('/anime-lists/');
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `https://nekokun.my.id/?s=${query}`, query }, 'Scraping search');
    return this.fetchWithRetry(`/?s=${encodeURIComponent(query)}`);
  }
}

export const sokujaScraper = new SokujaScraper();
