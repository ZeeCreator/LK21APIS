import { BaseScraper } from './baseScraper';
import { HttpClient } from '../utils/httpClient';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const BASE = 'https://anichin.ro';
const FALLBACK_BASE = 'https://anichin.cafe';

function countEpisodeLinks(html: string): number {
  const count1 = (html.match(/class="[^"]*ep-item[^"]*"/gi) || []).length;
  const count2 = (html.match(/class="[^"]*eplister[^"]*"/gi) || []).length;
  const count3 = (html.match(/episodelist/g) || []).length;
  return Math.max(count1, count2, count3);
}

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
    logger.info({ slug }, 'Scraping series detail');

    // Try primary source (anichin.ro) with built-in fallback proxy support
    let primaryHtml: string | null = null;
    try {
      primaryHtml = await this.fetchWithRetry(url, undefined, BASE + '/');
      const epCount = countEpisodeLinks(primaryHtml);
      logger.info({ source: 'anichin.ro', slug, epCount }, 'Primary source result');

      // If primary has enough episodes, return it
      if (epCount >= 3) return primaryHtml;
    } catch (err) {
      logger.warn({ source: 'anichin.ro', slug, err: String(err) }, 'Primary source failed');
    }

    // Try fallback source (anichin.cafe)
    logger.info({ source: 'anichin.cafe', slug }, 'Trying fallback source');
    const cafeHttp = new HttpClient(FALLBACK_BASE);
    const maxRetries = this.config.retryCount;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const html = await cafeHttp.getHTML(url);
        const epCount = countEpisodeLinks(html);
        logger.info({ source: 'anichin.cafe', slug, epCount }, 'Fallback source result');

        if (epCount > 0) return html;
        if (primaryHtml) return primaryHtml;
        return html;
      } catch (err: any) {
        // If 403 and fallback proxy is configured, try through proxy
        if (err?.response?.status === 403 && env.SCRAPER_FALLBACK_URL && this.fallbackHttp) {
          try {
            const fullUrl = FALLBACK_BASE.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
            logger.info({ fullUrl, fallback: env.SCRAPER_FALLBACK_URL }, 'Trying fallback proxy for anichin.cafe');
            const html = await this.fallbackHttp.getHTML('/' + fullUrl);
            return html;
          } catch (proxyErr) {
            logger.error({ proxyErr: String(proxyErr) }, 'Fallback proxy also failed');
          }
        }

        if (attempt < maxRetries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    // Return primary result if we got anything
    if (primaryHtml) return primaryHtml;
    throw new Error(`Failed to scrape series ${slug} from all sources`);
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
