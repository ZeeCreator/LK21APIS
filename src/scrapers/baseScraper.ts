import { HttpClient } from '../utils/httpClient';
import { scraperConfig } from '../config/app';
import { logger } from '../utils/logger';

export abstract class BaseScraper {
  protected http: HttpClient;
  protected config = scraperConfig;
  protected baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || scraperConfig.baseUrl;
    this.http = new HttpClient(this.baseUrl);
  }

  protected async fetchWithRetry(url: string, retries?: number): Promise<string> {
    const maxRetries = retries ?? this.config.retryCount;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.http.getHTML(url, {
          Referer: this.baseUrl + '/',
        });
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          { url, attempt, maxRetries, err: error },
          `Scraper attempt ${attempt}/${maxRetries} failed`
        );
        if (attempt < maxRetries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
