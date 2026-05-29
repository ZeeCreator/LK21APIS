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
}

export const sokujaScraper = new SokujaScraper();
