import axios from 'axios';
import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const BASE = 'https://s13.nontonanimeid.boats';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate',
  Referer: BASE + '/',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

export class NontonanimeScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  private async fetchWithBrowserHeaders(url: string): Promise<string> {
    const fullUrl = BASE + url;
    const maxRetries = env.SCRAPER_RETRY_COUNT;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await axios.get<string>(fullUrl, {
          headers: BROWSER_HEADERS,
          timeout: env.SCRAPER_TIMEOUT,
          responseType: 'text',
          decompress: true,
          maxRedirects: 5,
          validateStatus: (status) => status < 500,
        });

        if (res.status === 403) {
          const body = res.data || '';
          if (
            body.includes('cf-browser-verification') ||
            body.includes('challenge-form') ||
            body.includes('cloudflare') ||
            body.includes('Checking your browser') ||
            body.includes('LiteSpeed') ||
            body.includes('_lscache')
          ) {
            throw Object.assign(new Error('Blocked by WAF'), { code: 'WAF_BLOCKED' });
          }
          throw Object.assign(new Error(`HTTP ${res.status}`), { code: 'HTTP_ERROR' });
        }

        return res.data;
      } catch (error) {
        lastError = error as Error;
        const isWaf = (error as any)?.code === 'WAF_BLOCKED';
        logger.warn(
          { url: fullUrl, attempt, maxRetries, isWaf, err: error },
          `Nontonanime fetch ${attempt}/${maxRetries} failed`
        );
        if (attempt < maxRetries) {
          await this.delay((isWaf ? 3000 : env.SCRAPER_RETRY_DELAY) * attempt);
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${fullUrl} after ${maxRetries} retries`);
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: BASE + '/' }, 'Scraping Nontonanime homepage');
    return this.fetchWithBrowserHeaders('/');
  }

  async scrapeDetail(slug: string): Promise<string> {
    const url = `/anime/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping anime detail');
    return this.fetchWithBrowserHeaders(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode');
    return this.fetchWithBrowserHeaders(url);
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `${BASE}/?s=${query}`, query }, 'Scraping search');
    return this.fetchWithBrowserHeaders(`/?s=${encodeURIComponent(query)}`);
  }

  async scrapeJadwal(): Promise<string> {
    logger.info({ url: BASE + '/jadwal-rilis/' }, 'Scraping jadwal rilis');
    return this.fetchWithBrowserHeaders('/jadwal-rilis/');
  }

  async scrapePopuler(): Promise<string> {
    logger.info({ url: BASE + '/popular-series/' }, 'Scraping popular series');
    return this.fetchWithBrowserHeaders('/popular-series/');
  }

  async scrapeOngoing(): Promise<string> {
    logger.info({ url: BASE + '/ongoing-list/' }, 'Scraping ongoing list');
    return this.fetchWithBrowserHeaders('/ongoing-list/');
  }

  async scrapeGenre(): Promise<string> {
    logger.info({ url: BASE + '/genres/' }, 'Scraping genre list');
    return this.fetchWithBrowserHeaders('/genres/');
  }

  async scrapeGenreDetail(slug: string): Promise<string> {
    const url = `/genres/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping genre detail');
    return this.fetchWithBrowserHeaders(url);
  }
}

export const nontonanimeScraper = new NontonanimeScraper();
