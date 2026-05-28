import { HttpClient } from '../utils/httpClient';
import { logger } from '../utils/logger';

export interface ResolvedStream {
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  quality?: string;
}

export class StreamResolver {
  private http = new HttpClient();

  async resolve(embedUrl: string): Promise<ResolvedStream> {
    logger.info({ embedUrl }, 'Resolving stream URL');

    try {
      const html = await this.http.getHTML(embedUrl, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ladyriderswear.com/',
      });

      const directUrl = this.findDirectStreamUrl(html);
      if (directUrl) return directUrl;

      const redirectUrl = this.findRedirect(html);
      if (redirectUrl) {
        return this.resolve(redirectUrl);
      }
    } catch (err) {
      logger.warn({ err, embedUrl }, 'Stream resolution failed, falling back to embed URL');
    }

    return { url: embedUrl, type: 'embed' };
  }

  private findDirectStreamUrl(html: string): ResolvedStream | null {
    const patterns = [
      /<source[^>]+src\s*=\s*['"]([^'"]+\.(?:mp4|m3u8)[^'"]*)['"]/i,
      /<video[^>]+src\s*=\s*['"]([^'"]+\.(?:mp4|m3u8)[^'"]*)['"]/i,
      /https?:\/\/[^'"<\s]+\.mp4[^'"<\s]*(?:\?[^'"<\s]*)?/gi,
      /https?:\/\/[^'"<\s]+\.m3u8[^'"<\s]*(?:\?[^'"<\s]*)?/gi,
    ];

    for (const pattern of patterns.slice(0, 2)) {
      const m = html.match(pattern);
      if (m) {
        const url = m[1].replace(/\\/g, '');
        return { url, type: url.endsWith('.m3u8') ? 'm3u8' : 'mp4' };
      }
    }

    for (const pattern of patterns.slice(2)) {
      const all = html.matchAll(pattern);
      const urls = [...all].map(m => m[0].replace(/\\/g, ''));
      if (urls.length > 0) {
        const url = urls[0];
        return { url, type: url.endsWith('.m3u8') ? 'm3u8' : 'mp4' };
      }
    }

    return null;
  }

  private findRedirect(html: string): string | null {
    const patterns = [
      /window\.location\.href\s*=\s*['"]([^'"]+)['"]/,
      /location\.href\s*=\s*['"]([^'"]+)['"]/,
      /<meta[^>]+http-equiv\s*=\s*["']refresh["'][^>]+content\s*=\s*["'][^"']*url=([^"']+)["']/i,
    ];
    for (const pattern of patterns) {
      const m = html.match(pattern);
      if (m) {
        let url = m[1];
        if (url.startsWith('//')) url = 'https:' + url;
        else if (url.startsWith('/')) url = 'https://ladyriderswear.com' + url;
        else if (!url.startsWith('http')) url = 'https://' + url;
        return url;
      }
    }
    return null;
  }
}

export const streamResolver = new StreamResolver();
