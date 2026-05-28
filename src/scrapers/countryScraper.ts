import { BaseScraper } from './baseScraper';
import { parseCountries, ParsedCountry } from '../parsers/countryParser';
import { parseMovieList, ParsedMovieListItem } from '../parsers/movieParser';
import { logger } from '../utils/logger';

export class CountryScraper extends BaseScraper {
  async scrapeCountries(): Promise<ParsedCountry[]> {
    const url = '/';
    logger.info({ url }, 'Scraping countries from homepage nav');
    const html = await this.fetchWithRetry(url);
    return parseCountries(html);
  }

  async scrapeCountryMovies(slug: string, page: number = 1): Promise<ParsedMovieListItem[]> {
    const url = page <= 1 ? `/country/${slug}/` : `/country/${slug}/page/${page}/`;
    logger.info({ url, slug }, 'Scraping country movies');
    const html = await this.fetchWithRetry(url);
    return parseMovieList(html);
  }
}

export const countryScraper = new CountryScraper();
