import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper';
import { parseSubtitles, ParsedSubtitle } from '../parsers/subtitleParser';
import { logger } from '../utils/logger';

export class SubtitleScraper extends BaseScraper {
  async scrape(slug: string): Promise<ParsedSubtitle[]> {
    return this.scrapeWithFallback(slug, `/${slug}/`);
  }

  private async scrapeWithFallback(slug: string, url: string): Promise<ParsedSubtitle[]> {
    logger.info({ url, slug }, 'Scraping subtitles');
    const html = await this.fetchWithRetry(url);

    const $ = cheerio.load(html);
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical && !canonical.includes(`/${slug}/`) && !canonical.includes(`/${slug}`)) {
      if (!url.startsWith('/tv/')) {
        logger.info({ slug }, 'Subtitles: retrying with /tv/ prefix');
        return this.scrapeWithFallback(slug, `/tv/${slug}/`);
      }
      return [];
    }

    return parseSubtitles(html);
  }
}

export const subtitleScraper = new SubtitleScraper();
