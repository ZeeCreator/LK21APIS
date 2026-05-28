import { Redis, RedisOptions } from 'ioredis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  var __redis: Redis | undefined;
}

let isRedisConnected = false;

function createRedisClient(): Redis {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: () => null,
      lazyConnect: true,
    });
  }

  const options: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null,
    lazyConnect: true,
  };

  if (env.REDIS_PASSWORD) {
    options.password = env.REDIS_PASSWORD;
  }

  return new Redis(options);
}

export const redis: Redis = global.__redis ?? createRedisClient();

if (env.NODE_ENV === 'development') {
  global.__redis = redis;
}

redis.on('connect', () => {
  isRedisConnected = true;
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error({ err: error }, 'Redis connection error');
});

export function getRedisStatus(): boolean {
  return isRedisConnected;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    isRedisConnected = true;
  } catch (error) {
    logger.warn('Redis is not available - running without cache');
    isRedisConnected = false;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
  } catch {
    // ignore
  }
  isRedisConnected = false;
  logger.info('Redis disconnected');
}
