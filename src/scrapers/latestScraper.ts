import { BaseScraper } from './baseScraper';
import { parseMovieList, ParsedMovieListItem } from '../parsers/movieParser';
import { logger } from '../utils/logger';

export class LatestScraper extends BaseScraper {
  async scrape(page: number = 1): Promise<ParsedMovieListItem[]> {
    const url = page <= 1 ? '/' : `/page/${page}/`;
    logger.info({ url, page }, 'Scraping latest movies');
    const html = await this.fetchWithRetry(url);
    return parseMovieList(html);
  }

  async scrapeRebahin(page: number = 1): Promise<ParsedMovieListItem[]> {
    const url = page <= 1 ? '/rebahin/' : `/rebahin/page/${page}/`;
    logger.info({ url, page }, 'Scraping rebahin movies');
    const html = await this.fetchWithRetry(url);
    return parseMovieList(html);
  }

  async scrapeSeries(page: number = 1): Promise<ParsedMovieListItem[]> {
    const url = page <= 1 ? '/serial-tv-terbaru/' : `/serial-tv-terbaru/page/${page}/`;
    logger.info({ url, page }, 'Scraping series');
    const html = await this.fetchWithRetry(url);
    return parseMovieList(html);
  }
}

export const latestScraper = new LatestScraper();
