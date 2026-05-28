import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper';
import { parseWatchSources, parseServerTabs, ParsedWatchSource } from '../parsers/watchParser';
import { logger } from '../utils/logger';
import { streamResolver } from '../services/streamResolver';
import { rankSources } from '../services/embedRanker';

const EPISODE_PATTERN = /-season-\d+-episode-\d+/i;

export class WatchScraper extends BaseScraper {
  async scrape(slug: string, resolveStreams = false): Promise<ParsedWatchSource[]> {
    const isEpisode = EPISODE_PATTERN.test(slug);
    if (isEpisode) {
      logger.info({ slug }, 'Watch: detected episode slug, trying /eps/ prefix');
      try {
        const html = await this.fetchWithRetry(`/eps/${slug}/`);
        return this.resolvePage(html, slug, resolveStreams);
      } catch (err) {
        logger.warn({ slug, err }, 'Watch: episode path failed');
        return [];
      }
    }
    return this.scrapeWithFallback(slug, `/${slug}/`, resolveStreams);
  }

  private async resolvePage(html: string, slug: string, resolveStreams: boolean): Promise<ParsedWatchSource[]> {
    const sources = parseWatchSources(html);
    const tabs = parseServerTabs(html);

    if (tabs.length > 0) {
      const resolved = await this.resolveServerTabs(slug, tabs, sources);
      const ranked = rankSources(resolved);
      const filtered = ranked.filter((s) => !s.blocked).map((s) => ({
        url: s.url, server: s.server, isEmbed: s.isEmbed,
        streamUrl: s.streamUrl, streamType: s.streamType,
      }));
      if (resolveStreams) return await this.resolveToStreams(filtered);
      return filtered;
    }

    const ranked = rankSources(sources);
    const filtered = ranked.filter((s) => !s.blocked).map((s) => ({
      url: s.url, server: s.server, isEmbed: s.isEmbed,
      streamUrl: s.streamUrl, streamType: s.streamType,
    }));
    if (resolveStreams) return await this.resolveToStreams(filtered);
    return filtered;
  }

  private async scrapeWithFallback(slug: string, url: string, resolveStreams = false): Promise<ParsedWatchSource[]> {
    logger.info({ url, slug }, 'Scraping watch sources');
    const html = await this.fetchWithRetry(url);

    const $ = cheerio.load(html);
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical && !canonical.includes(`/${slug}/`) && !canonical.includes(`/${slug}`)) {
      if (EPISODE_PATTERN.test(slug) && !url.startsWith('/eps/')) {
        logger.info({ slug }, 'Watch: canonical mismatch, retrying with /eps/ prefix');
        return this.scrapeWithFallback(slug, `/eps/${slug}/`, resolveStreams);
      }
      if (!url.startsWith('/tv/')) {
        logger.info({ slug }, 'Watch: retrying with /tv/ prefix');
        return this.scrapeWithFallback(slug, `/tv/${slug}/`, resolveStreams);
      }
      return [];
    }

    return this.resolvePage(html, slug, resolveStreams);
  }

  private async resolveToStreams(sources: ParsedWatchSource[]): Promise<ParsedWatchSource[]> {
    const resolved = await Promise.allSettled(
      sources.map(async (source) => {
        if (!source.isEmbed || !source.url.startsWith('http')) return source;
        const stream = await streamResolver.resolve(source.url);
        return { ...source, streamUrl: stream.url, streamType: stream.type };
      })
    );
    return resolved.map((r) => (r.status === 'fulfilled' ? r.value : r.reason));
  }

  private async resolveServerTabs(
    slug: string,
    tabs: { name: string; pageUrl: string }[],
    existingSources: ParsedWatchSource[]
  ): Promise<ParsedWatchSource[]> {
    const resolved: ParsedWatchSource[] = [...existingSources];

    const results = await Promise.allSettled(
      tabs.map(async (tab) => {
        try {
          const html = await this.fetchWithRetry(tab.pageUrl, 1);
          const $ = cheerio.load(html);
          const iframeSrc = $('.gmr-embed-responsive iframe').first().attr('src') || '';
          if (iframeSrc) {
            return { url: iframeSrc, server: tab.name, isEmbed: true };
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        resolved.push(result.value);
      }
    }

    return resolved;
  }
}

export const watchScraper = new WatchScraper();
