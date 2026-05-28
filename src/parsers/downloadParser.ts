import * as cheerio from 'cheerio';

export interface ParsedDownloadLink {
  url: string;
  quality?: string;
  size?: string;
  provider?: string;
}

export function parseDownloadLinks(html: string): ParsedDownloadLink[] {
  const $ = cheerio.load(html);
  const links: ParsedDownloadLink[] = [];

  $('.gmr-download-wrap .gmr-download-list li a').each((_, el) => {
    const url = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const provider = $(el).attr('title')?.replace(/^Link Download \d+\s*/i, '').trim() || undefined;
    const size = $(el).attr('data-size') || undefined;

    if (url) {
      links.push({ url, quality: undefined, size, provider: provider || text || undefined });
    }
  });

  return links;
}
