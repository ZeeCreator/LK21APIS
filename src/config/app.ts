import { env } from './env';

export const scraperConfig = {
  baseUrl: env.SCRAPER_BASE_URL,
  timeout: env.SCRAPER_TIMEOUT,
  retryCount: env.SCRAPER_RETRY_COUNT,
  retryDelay: env.SCRAPER_RETRY_DELAY,
  userAgent: env.SCRAPER_USER_AGENT,
  endpoints: {
    latest: '/',
    trending: '/',
    search: '/?s=',
    detail: '/',
    genre: '/genre/',
    country: '/country/',
    watch: '/',
    download: '/',
    subtitle: '/',
  },
};

export const cacheConfig = {
  ttl: {
    latest: env.CACHE_TTL_LATEST,
    trending: env.CACHE_TTL_TRENDING,
    detail: env.CACHE_TTL_DETAIL,
    search: env.CACHE_TTL_SEARCH,
  },
  prefix: 'dutamovie:',
};

export const queueConfig = {
  concurrency: env.QUEUE_CONCURRENCY,
  defaultJobs: env.QUEUE_DEFAULT_JOBS,
  queues: {
    sync: 'dutamovie-sync',
    cacheCleanup: 'dutamovie-cache-cleanup',
    deadLinkCheck: 'dutamovie-dead-link',
    retryScraper: 'dutamovie-retry-scraper',
  },
};

export const rateLimitConfig = {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW_MS,
};
