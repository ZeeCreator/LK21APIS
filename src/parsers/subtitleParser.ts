import * as cheerio from 'cheerio';

export interface ParsedSubtitle {
  language: string;
  url: string;
  provider?: string;
}

export function parseSubtitles(html: string): ParsedSubtitle[] {
  const $ = cheerio.load(html);
  const subtitles: ParsedSubtitle[] = [];

  $('.subtitle-item, .subtitle-link a, .subs a, .subtitle-list a').each((_, el) => {
    const url = $(el).attr('href') || '';
    const language = $(el).find('.language').text().trim() || $(el).text().trim() || '';
    const provider = $(el).attr('data-provider') || undefined;

    if (url && language) {
      subtitles.push({ language, url, provider });
    }
  });

  $('.gmr-subtitle-list a, .subtitle-track a').each((_, el) => {
    const url = $(el).attr('href') || '';
    const language = $(el).attr('hreflang') || $(el).text().trim() || 'Unknown';
    if (url) {
      subtitles.push({ language, url });
    }
  });

  return subtitles;
}
