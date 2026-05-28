import { BaseScraper } from './baseScraper';
import { parseGenres, ParsedGenre } from '../parsers/genreParser';
import { parseMovieList, ParsedMovieListItem } from '../parsers/movieParser';
import { logger } from '../utils/logger';

export class GenreScraper extends BaseScraper {
  async scrapeGenres(): Promise<ParsedGenre[]> {
    const url = '/';
    logger.info({ url }, 'Scraping genres from homepage nav');
    const html = await this.fetchWithRetry(url);
    return parseGenres(html);
  }

  async scrapeGenreMovies(slug: string, page: number = 1): Promise<ParsedMovieListItem[]> {
    const url = page <= 1 ? `/${slug}/` : `/${slug}/page/${page}/`;
    logger.info({ url, slug }, 'Scraping genre movies');
    const html = await this.fetchWithRetry(url);
    return parseMovieList(html);
  }
}

export const genreScraper = new GenreScraper();
