import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

const BASE = 'https://anichin.cafe';

export class AnichinScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping Anichin homepage');
    return this.fetchWithRetry('/');
  }

  async scrapeSeries(slug: string): Promise<string> {
    const url = `/seri/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping series detail');
    return this.fetchWithRetry(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode page');
    return this.fetchWithRetry(url);
  }

  async scrapeOngoing(page: number = 1): Promise<string> {
    const url = page > 1 ? `/ongoing/page/${page}/` : '/ongoing/';
    logger.info({ url: BASE + url, page }, 'Scraping ongoing list');
    return this.fetchWithRetry(url);
  }

  async scrapeCompleted(page: number = 1): Promise<string> {
    const url = page > 1 ? `/completed/page/${page}/` : '/completed/';
    logger.info({ url: BASE + url, page }, 'Scraping completed list');
    return this.fetchWithRetry(url);
  }

  async scrapeSchedule(): Promise<string> {
    logger.info({ url: BASE + '/schedule/' }, 'Scraping schedule');
    return this.fetchWithRetry('/schedule/');
  }

  async scrapeSearch(query: string): Promise<string> {
    const qs = `?s=${encodeURIComponent(query)}`;
    logger.info({ url: BASE + '/' + qs, query }, 'Scraping search');
    return this.fetchWithRetry('/' + qs);
  }
}

export const anichinScraper = new AnichinScraper();
