import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const BASE = 'https://s13.nontonanimeid.boats';

export class NontonanimeScraper extends BaseScraper {
  constructor() {
    super(BASE);
  }

  private async fetchWithCloudscraper(url: string): Promise<string> {
    const fullUrl = BASE + url;
    const maxRetries = env.SCRAPER_RETRY_COUNT;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const cs = require('cloudscraper');
        const html = await cs.get(fullUrl);
        return html;
      } catch (error) {
        lastError = error as Error;
        const msg = (error as any)?.message || '';
        const isWaf =
          msg.includes('Cloudflare') ||
          msg.includes('challenge') ||
          msg.includes('WAF') ||
          msg.includes('403');

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
    return this.fetchWithCloudscraper('/');
  }

  async scrapeDetail(slug: string): Promise<string> {
    const url = `/anime/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping anime detail');
    return this.fetchWithCloudscraper(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping episode');
    return this.fetchWithCloudscraper(url);
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `${BASE}/?s=${query}`, query }, 'Scraping search');
    return this.fetchWithCloudscraper(`/?s=${encodeURIComponent(query)}`);
  }

  async scrapeJadwal(): Promise<string> {
    logger.info({ url: BASE + '/jadwal-rilis/' }, 'Scraping jadwal rilis');
    return this.fetchWithCloudscraper('/jadwal-rilis/');
  }

  async scrapePopuler(): Promise<string> {
    logger.info({ url: BASE + '/popular-series/' }, 'Scraping popular series');
    return this.fetchWithCloudscraper('/popular-series/');
  }

  async scrapeOngoing(): Promise<string> {
    logger.info({ url: BASE + '/ongoing-list/' }, 'Scraping ongoing list');
    return this.fetchWithCloudscraper('/ongoing-list/');
  }

  async scrapeGenre(): Promise<string> {
    logger.info({ url: BASE + '/genres/' }, 'Scraping genre list');
    return this.fetchWithCloudscraper('/genres/');
  }

  async scrapeGenreDetail(slug: string): Promise<string> {
    const url = `/genres/${slug}/`;
    logger.info({ url: BASE + url, slug }, 'Scraping genre detail');
    return this.fetchWithCloudscraper(url);
  }
}

export const nontonanimeScraper = new NontonanimeScraper();
