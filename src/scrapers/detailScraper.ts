import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper';
import { parseMovieDetail, parseEpisodeDetail, ParsedMovie } from '../parsers/movieParser';
import { parseServerTabs } from '../parsers/watchParser';
import { rankSources } from '../services/embedRanker';
import { logger } from '../utils/logger';

const EPISODE_PATTERN = /-season-\d+-episode-\d+/i;

export class DetailScraper extends BaseScraper {
  async scrape(slug: string): Promise<ParsedMovie> {
    const isEpisode = EPISODE_PATTERN.test(slug);
    if (isEpisode) {
      try {
        logger.info({ slug }, 'Detected episode slug, trying /eps/ prefix');
        const html = await this.fetchWithRetry(`/eps/${slug}/`);
        const parsed = parseEpisodeDetail(html, slug);
        const resolvedSources = await this.resolveEpisodeSources(html);
        parsed.watchSources = resolvedSources;
        return parsed;
      } catch (err) {
        logger.warn({ slug, err }, 'Episode path failed, falling back');
      }
    }
    return this.scrapeWithFallback(slug, `/${slug}/`);
  }

  private async resolveEpisodeSources(html: string) {
    const inlineIframes = parseWatchSources(html);
    const tabs = parseServerTabs(html);

    const resolved: { url: string; server?: string; isEmbed?: boolean }[] = [...inlineIframes];

    if (tabs.length > 0) {
      const results = await Promise.allSettled(
        tabs.map(async (tab) => {
          try {
            const tabHtml = await this.fetchWithRetry(tab.pageUrl, 1);
            const $ = cheerio.load(tabHtml);
            const iframeSrc = $('.gmr-embed-responsive iframe').first().attr('src') || '';
            if (iframeSrc) return { url: iframeSrc, server: tab.name, isEmbed: true };
            return null;
          } catch {
            return null;
          }
        })
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) resolved.push(r.value);
      }
    }

    const ranked = rankSources(resolved);
    return ranked.filter((s) => !s.blocked).map((s) => ({
      url: s.url, server: s.server, isEmbed: s.isEmbed,
      streamUrl: s.streamUrl, streamType: s.streamType,
    }));
  }

  private async scrapeWithFallback(slug: string, url: string): Promise<ParsedMovie> {
    logger.info({ url, slug }, 'Scraping movie detail');
    const html = await this.fetchWithRetry(url);

    const $ = cheerio.load(html);
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical && !canonical.includes(`/${slug}/`) && !canonical.includes(`/${slug}`)) {
      if (!url.startsWith('/tv/')) {
        logger.info({ slug }, 'Retrying with /tv/ prefix');
        return this.scrapeWithFallback(slug, `/tv/${slug}/`);
      }
      const err: any = new Error(`Movie not found: ${slug}`);
      err.code = 404;
      throw err;
    }

    return parseMovieDetail(html);
  }
}

export const detailScraper = new DetailScraper();

function parseWatchSources(html: string) {
  const $ = cheerio.load(html);
  const sources: { url: string; server?: string; isEmbed?: boolean }[] = [];
  $('.gmr-embed-responsive iframe').each((_, el) => {
    const url = $(el).attr('src') || '';
    if (url) sources.push({ url, server: 'iframe', isEmbed: true });
  });
  return sources;
}
