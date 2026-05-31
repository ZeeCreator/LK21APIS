import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

const BASE = 'https://anichin.moe';

export class AnichinScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping Anichin homepage');
    return this.fetchWithRetry('/', undefined, 'https://google.com/');
  }

  async scrapeSeries(slug: string): Promise<string> {
    const paths = [`/seri/${slug}/`, `/anime/${slug}/`];
    let lastErr: Error | null = null;
    for (const url of paths) {
      try {
        logger.info({ url: BASE + url, slug }, 'Scraping series detail');
        return await this.fetchWithRetry(url, undefined, BASE + '/');
      } catch (err) {
        lastErr = err as Error;
        logger.warn({ url: BASE + url, slug, err: String(err) }, 'Series path failed, trying next');
      }
    }
    throw lastErr || new Error(`Failed to scrape series ${slug}`);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode page');
    return this.fetchWithRetry(url, undefined, BASE + '/');
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
