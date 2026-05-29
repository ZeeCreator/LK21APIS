import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

export class SokujaScraper extends BaseScraper {
  constructor() {
    super('https://x5.sokuja.uk');
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: 'https://x5.sokuja.uk/' }, 'Scraping Sokuja homepage');
    return this.fetchWithRetry('/');
  }
}

export const sokujaScraper = new SokujaScraper();
