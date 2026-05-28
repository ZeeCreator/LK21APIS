import * as cheerio from 'cheerio';
import { scraperConfig } from '../config/app';

export interface ParsedWatchSource {
  url: string;
  quality?: string;
  server?: string;
  isEmbed?: boolean;
  streamUrl?: string;
  streamType?: 'mp4' | 'm3u8' | 'embed';
}

export interface ParsedServerTab {
  name: string;
  pageUrl: string;
}

export function parseWatchSources(html: string): ParsedWatchSource[] {
  const $ = cheerio.load(html);
  const sources: ParsedWatchSource[] = [];

  $('.gmr-embed-responsive iframe').each((_, el) => {
    const url = $(el).attr('src') || '';
    if (url) {
      sources.push({ url, server: 'iframe', isEmbed: true });
    }
  });

  return sources;
}

export function parseServerTabs(html: string): ParsedServerTab[] {
  const $ = cheerio.load(html);
  const tabs: ParsedServerTab[] = [];

  $('.muvipro-player-tabs li a').each((_, el) => {
    let url = $(el).attr('href') || '';
    const name = $(el).text().trim();
    if (url && name) {
      if (url.startsWith('/')) {
        url = scraperConfig.baseUrl.replace(/\/$/, '') + url;
      }
      tabs.push({ name, pageUrl: url });
    }
  });

  return tabs;
}
