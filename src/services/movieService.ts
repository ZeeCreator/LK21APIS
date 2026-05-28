import { prisma, getDatabaseStatus } from '../config/database';
import { cache } from '../cache/redisCache';
import { cacheConfig } from '../config/app';
import { latestScraper, detailScraper, searchScraper, genreScraper, countryScraper } from '../scrapers';
import { getPaginationMeta, PaginationParams } from '../utils/response';
import { Prisma } from '@prisma/client';

export class MovieService {
  async getLatest(page: number = 1, limit: number = 20) {
    const cacheKey = `latest:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };
    let movies: any[];
    let total = 0;

    if (getDatabaseStatus()) {
      try {
        total = await prisma.movie.count({ where: { isLatest: true } });
        if (total > 0) {
          movies = await prisma.movie.findMany({
            where: { isLatest: true },
            orderBy: { createdAt: 'desc' },
            skip: params.offset,
            take: params.limit,
            include: { genres: true },
          });
          const meta = getPaginationMeta(total, params);
          const result = { data: movies, meta };
          await cache.set(cacheKey, result, cacheConfig.ttl.latest);
          return result;
        }
      } catch {
        // DB unavailable, fallback to scraper
      }
    }

    movies = await latestScraper.scrape(page);
    const meta = getPaginationMeta(movies.length, { ...params, limit: movies.length });
    const result = { data: movies, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.latest);
    return result;
  }

  async getTrending(page: number = 1, limit: number = 20) {
    const cacheKey = `trending:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };
    let movies: any[];
    let total = 0;

    if (getDatabaseStatus()) {
      try {
        total = await prisma.movie.count({ where: { isTrending: true } });
        if (total > 0) {
          movies = await prisma.movie.findMany({
            where: { isTrending: true },
            orderBy: { rating: 'desc' },
            skip: params.offset,
            take: params.limit,
            include: { genres: true },
          });
          const meta = getPaginationMeta(total, params);
          const result = { data: movies, meta };
          await cache.set(cacheKey, result, cacheConfig.ttl.trending);
          return result;
        }
      } catch {
        // fallback
      }
    }

    movies = await latestScraper.scrape(page);
    const meta = getPaginationMeta(movies.length, { ...params, limit: movies.length });
    const result = { data: movies, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.trending);
    return result;
  }

  async getDetail(slug: string) {
    const cacheKey = `detail:${slug}`;
    const cached = await cache.get<any>(cacheKey);
    if (cached) return cached;

    if (getDatabaseStatus()) {
      try {
        const movie = await prisma.movie.findUnique({
          where: { slug },
          include: { genres: true, downloads: true, subtitles: true },
        });
        if (movie) {
          await cache.set(cacheKey, movie, cacheConfig.ttl.detail);
          return movie;
        }
      } catch {
        // fallback
      }
    }

    const scraped = await detailScraper.scrape(slug);
    await cache.set(cacheKey, scraped, cacheConfig.ttl.detail);
    return scraped;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const cacheKey = `search:${query}:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };

    if (getDatabaseStatus()) {
      try {
        const where: Prisma.MovieWhereInput = {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { titleEn: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
          ],
        };
        const [total, movies] = await Promise.all([
          prisma.movie.count({ where }),
          prisma.movie.findMany({
            where,
            orderBy: { rating: 'desc' },
            skip: params.offset,
            take: params.limit,
            include: { genres: true },
          }),
        ]);
        if (total > 0) {
          const meta = getPaginationMeta(total, params);
          const result = { data: movies, meta };
          await cache.set(cacheKey, result, cacheConfig.ttl.search);
          return result;
        }
      } catch {
        // fallback
      }
    }

    const scraped = await searchScraper.scrape(query, page);
    const meta = getPaginationMeta(scraped.totalResults, params);
    const result = { data: scraped.movies, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.search);
    return result;
  }

  async getByGenre(slug: string, page: number = 1, limit: number = 20) {
    const cacheKey = `genre:${slug}:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };

    if (getDatabaseStatus()) {
      try {
        const [total, movies] = await Promise.all([
          prisma.movie.count({ where: { genres: { some: { slug } } } }),
          prisma.movie.findMany({
            where: { genres: { some: { slug } } },
            orderBy: { createdAt: 'desc' },
            skip: params.offset,
            take: params.limit,
            include: { genres: true },
          }),
        ]);
        if (total > 0) {
          const meta = getPaginationMeta(total, params);
          const result = { data: movies, meta };
          await cache.set(cacheKey, result, cacheConfig.ttl.search);
          return result;
        }
      } catch {
        // fallback
      }
    }

    const scraped = await genreScraper.scrapeGenreMovies(slug, page);
    const meta = getPaginationMeta(scraped.length, params);
    const result = { data: scraped, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.search);
    return result;
  }

  async getByCountry(slug: string, page: number = 1, limit: number = 20) {
    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };

    if (getDatabaseStatus()) {
      try {
        const [total, movies] = await Promise.all([
          prisma.movie.count({ where: { country: { equals: slug, mode: 'insensitive' as const } } }),
          prisma.movie.findMany({
            where: { country: { equals: slug, mode: 'insensitive' as const } },
            orderBy: { createdAt: 'desc' },
            skip: params.offset,
            take: params.limit,
            include: { genres: true },
          }),
        ]);
        if (total > 0) {
          const meta = getPaginationMeta(total, params);
          return { data: movies, meta };
        }
      } catch {
        // fallback
      }
    }

    const scraped = await countryScraper.scrapeCountryMovies(slug, page);
    const meta = getPaginationMeta(scraped.length, params);
    return { data: scraped, meta };
  }

  async getRebahin(page: number = 1, limit: number = 20) {
    const cacheKey = `rebahin:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };
    const movies = await latestScraper.scrapeRebahin(page);
    const meta = getPaginationMeta(movies.length, { ...params, limit: movies.length });
    const result = { data: movies, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.latest);
    return result;
  }

  async getSeries(page: number = 1, limit: number = 20) {
    const cacheKey = `series:${page}:${limit}`;
    const cached = await cache.get<{ data: any; meta: any }>(cacheKey);
    if (cached) return cached;

    const params: PaginationParams = { page, limit, offset: (page - 1) * limit };
    const movies = await latestScraper.scrapeSeries(page);
    const meta = getPaginationMeta(movies.length, { ...params, limit: movies.length });
    const result = { data: movies, meta };
    await cache.set(cacheKey, result, cacheConfig.ttl.latest);
    return result;
  }
}

export const movieService = new MovieService();
