import { BaseScraper } from './baseScraper';
import { HttpClient } from '../utils/httpClient';
import { logger } from '../utils/logger';

const BASE = 'https://anichin.ro';
const FALLBACK_BASE = 'https://anichin.cafe';

export class AnichinScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping Anichin homepage');
    return this.fetchWithRetry('/', undefined, 'https://google.com/');
  }

  async scrapeSeries(slug: string): Promise<string> {
    const url = `/seri/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping series detail from anichin.cafe');
    const fallbackHttp = new HttpClient(FALLBACK_BASE);
    return fallbackHttp.getHTML(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode page');
    return this.fetchWithRetry(url, undefined, BASE + '/ongoing/');
  }

  async scrapeLatest(page: number = 1): Promise<string> {
    const url = page > 1 ? `/anime/page/${page}/` : '/anime/';
    logger.info({ url: BASE + url, page }, 'Scraping latest anime list');
    return this.fetchWithRetry(url, undefined, BASE + '/');
  }

  async scrapeSchedule(): Promise<string> {
    logger.info({ url: BASE + '/schedule/' }, 'Scraping schedule');
    return this.fetchWithRetry('/schedule/', undefined, BASE + '/');
  }

  async scrapeSearch(query: string): Promise<string> {
    const qs = `?s=${encodeURIComponent(query)}`;
    logger.info({ url: BASE + '/' + qs, query }, 'Scraping search');
    return this.fetchWithRetry('/' + qs, undefined, BASE + '/');
  }
}

export const anichinScraper = new AnichinScraper();
