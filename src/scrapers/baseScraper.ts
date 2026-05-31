import { HttpClient } from '../utils/httpClient';
import { env } from '../config/env';
import { scraperConfig } from '../config/app';
import { logger } from '../utils/logger';

export abstract class BaseScraper {
  protected http: HttpClient;
  protected fallbackHttp: HttpClient | null = null;
  protected config = scraperConfig;
  protected baseUrl: string;
  private cookieJar: string = '';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || scraperConfig.baseUrl;
    this.http = new HttpClient(this.baseUrl);
    if (env.SCRAPER_FALLBACK_URL) {
      this.fallbackHttp = new HttpClient(env.SCRAPER_FALLBACK_URL);
    }
  }

  protected async fetchWithRetry(
    url: string,
    retries?: number,
    referer?: string
  ): Promise<string> {
    const maxRetries = retries ?? this.config.retryCount;
    let lastError: Error | null = null;

    const headers: Record<string, string> = {
      Referer: referer || this.baseUrl + '/',
    };

    if (this.cookieJar) {
      headers['Cookie'] = this.cookieJar;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const html = await this.http.getHTML(url, headers);
        return html;
      } catch (error: any) {
        lastError = error as Error;

        if (error?.response) {
          const status = error.response.status;
          const body = error.response.data || '';
          const snippet = typeof body === 'string' ? body.substring(0, 500) : '';

          if (status === 403) {
            logger.error(
              { url, attempt, status, snippet },
              'Received 403 - possible Cloudflare/IP block'
            );
          }

          if (error.response.headers?.['set-cookie']) {
            this.cookieJar = error.response.headers['set-cookie'].join('; ');
          }
        }

        logger.warn(
          { url, attempt, maxRetries, err: String(error) },
          `Scraper attempt ${attempt}/${maxRetries} failed`
        );
        if (attempt < maxRetries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    if (this.fallbackHttp && lastError) {
      const fullUrl = this.baseUrl.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
      logger.info({ fullUrl, fallback: env.SCRAPER_FALLBACK_URL }, 'Trying fallback scraper proxy');
      try {
        const html = await this.fallbackHttp.getHTML('/' + fullUrl);
        return html;
      } catch (fallbackErr) {
        logger.error({ fallbackErr: String(fallbackErr) }, 'Fallback scraper also failed');
        lastError = fallbackErr as Error;
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
