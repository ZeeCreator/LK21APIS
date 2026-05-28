import { BaseScraper } from './baseScraper';
import { parseSearchResults, ParsedSearchResult } from '../parsers/searchParser';
import { logger } from '../utils/logger';

export class SearchScraper extends BaseScraper {
  async scrape(query: string, page: number = 1): Promise<ParsedSearchResult> {
    const encoded = encodeURIComponent(query);
    const params = page > 1 ? `&page=${page}` : '';
    const url = `/?s=${encoded}${params}`;
    logger.info({ url, query }, 'Scraping search results');
    const html = await this.fetchWithRetry(url);
    return parseSearchResults(html, query);
  }
}

export const searchScraper = new SearchScraper();
