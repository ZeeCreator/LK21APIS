import { BaseScraper } from './baseScraper';
import { logger } from '../utils/logger';

export class NontonanimeScraper extends BaseScraper {
  constructor() {
    super('https://s13.nontonanimeid.boats');
  }

  async scrapeHomepage(): Promise<string> {
    logger.info({ url: 'https://s13.nontonanimeid.boats/' }, 'Scraping Nontonanime homepage');
    return this.fetchWithRetry('/');
  }

  async scrapeDetail(slug: string): Promise<string> {
    const url = `/anime/${slug}/`;
    logger.info({ url: `https://s13.nontonanimeid.boats${url}`, slug }, 'Scraping anime detail');
    return this.fetchWithRetry(url);
  }

  async scrapeEpisode(slug: string): Promise<string> {
    const url = `/${slug}/`;
    logger.info({ url: `https://s13.nontonanimeid.boats${url}`, slug }, 'Scraping episode');
    return this.fetchWithRetry(url);
  }

  async scrapeSearch(query: string): Promise<string> {
    logger.info({ url: `https://s13.nontonanimeid.boats/?s=${query}`, query }, 'Scraping search');
    return this.fetchWithRetry(`/?s=${encodeURIComponent(query)}`);
  }

  async scrapeJadwal(): Promise<string> {
    logger.info({ url: 'https://s13.nontonanimeid.boats/jadwal-rilis/' }, 'Scraping jadwal rilis');
    return this.fetchWithRetry('/jadwal-rilis/');
  }

  async scrapePopuler(): Promise<string> {
    logger.info({ url: 'https://s13.nontonanimeid.boats/popular-series/' }, 'Scraping popular series');
    return this.fetchWithRetry('/popular-series/');
  }

  async scrapeOngoing(): Promise<string> {
    logger.info({ url: 'https://s13.nontonanimeid.boats/ongoing-list/' }, 'Scraping ongoing list');
    return this.fetchWithRetry('/ongoing-list/');
  }

  async scrapeGenre(): Promise<string> {
    logger.info({ url: 'https://s13.nontonanimeid.boats/genres/' }, 'Scraping genre list');
    return this.fetchWithRetry('/genres/');
  }

  async scrapeGenreDetail(slug: string): Promise<string> {
    const url = `/genres/${slug}/`;
    logger.info({ url: `https://s13.nontonanimeid.boats${url}`, slug }, 'Scraping genre detail');
    return this.fetchWithRetry(url);
  }
}

export const nontonanimeScraper = new NontonanimeScraper();
