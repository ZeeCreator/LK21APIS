import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.coerce.number().default(3000),
  APP_HOST: z.string().default('0.0.0.0'),
  APP_NAME: z.string().default('DutaMovie API'),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().url().optional()
  ),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_URL: z.string().optional(),

  SCRAPER_BASE_URL: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().url().default('https://ladyriderswear.com')
  ),
  SCRAPER_TIMEOUT: z.coerce.number().default(30000),
  SCRAPER_RETRY_COUNT: z.coerce.number().default(3),
  SCRAPER_RETRY_DELAY: z.coerce.number().default(1000),
  SCRAPER_USER_AGENT: z.string().default(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  ),

  PUPPETEER_HEADLESS: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),

  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  QUEUE_DEFAULT_JOBS: z.coerce.number().default(100),

  CACHE_TTL_LATEST: z.coerce.number().default(900),
  CACHE_TTL_TRENDING: z.coerce.number().default(1800),
  CACHE_TTL_DETAIL: z.coerce.number().default(3600),
  CACHE_TTL_SEARCH: z.coerce.number().default(600),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  CORS_ORIGIN: z.string().default('*'),

  LOG_LEVEL: z.string().default('info'),
  LOG_PRETTY: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
