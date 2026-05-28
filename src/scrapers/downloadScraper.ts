import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper';
import { parseDownloadLinks, ParsedDownloadLink } from '../parsers/downloadParser';
import { logger } from '../utils/logger';

export class DownloadScraper extends BaseScraper {
  async scrape(slug: string): Promise<ParsedDownloadLink[]> {
    return this.scrapeWithFallback(slug, `/${slug}/`);
  }

  private async scrapeWithFallback(slug: string, url: string): Promise<ParsedDownloadLink[]> {
    logger.info({ url, slug }, 'Scraping download links');
    const html = await this.fetchWithRetry(url);

    const $ = cheerio.load(html);
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical && !canonical.includes(`/${slug}/`) && !canonical.includes(`/${slug}`)) {
      if (!url.startsWith('/tv/')) {
        logger.info({ slug }, 'Download: retrying with /tv/ prefix');
        return this.scrapeWithFallback(slug, `/tv/${slug}/`);
      }
      return [];
    }

    return parseDownloadLinks(html);
  }
}

export const downloadScraper = new DownloadScraper();
