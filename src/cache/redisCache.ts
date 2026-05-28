import { redis, getRedisStatus } from '../config/redis';
import { cacheConfig } from '../config/app';

class InMemoryCache {
  private store = new Map<string, { value: string; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    this.store.set(key, {
      value: JSON.stringify(value),
      expiry: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

export class RedisCache {
  private readonly prefix: string;
  private memory: InMemoryCache | null = null;

  constructor(prefix: string = cacheConfig.prefix) {
    this.prefix = prefix;
    if (!getRedisStatus()) {
      this.memory = new InMemoryCache();
    }
  }

  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private useRedis(): boolean {
    return getRedisStatus();
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    if (!this.useRedis()) {
      return this.memory!.get<T>(fullKey);
    }
    try {
      const data = await redis.get(fullKey);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    const fullKey = this.buildKey(key);
    if (!this.useRedis()) {
      return this.memory!.set(fullKey, value, ttl);
    }
    try {
      await redis.setex(fullKey, ttl, JSON.stringify(value));
    } catch {
      this.memory = this.memory ?? new InMemoryCache();
      await this.memory!.set(fullKey, value, ttl);
    }
  }

  async del(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    if (!this.useRedis()) {
      return this.memory!.del(fullKey);
    }
    try {
      await redis.del(fullKey);
    } catch {
      // ignore
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.useRedis()) {
      return this.memory!.delPattern(this.buildKey(pattern));
    }
    try {
      const keys = await redis.keys(this.buildKey(pattern));
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      // ignore
    }
  }

  async flush(): Promise<void> {
    if (!this.useRedis()) {
      return this.memory!.flush();
    }
    try {
      const keys = await redis.keys(`${this.prefix}*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      // ignore
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    if (!this.useRedis()) {
      return this.memory!.exists(fullKey);
    }
    try {
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch {
      return false;
    }
  }
}

export const cache = new RedisCache();
