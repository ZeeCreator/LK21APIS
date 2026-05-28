import { logger } from '../utils/logger';

export const prisma: any = new Proxy(
  {},
  {
    get() {
      throw new Error('Database not available - Prisma has been removed');
    },
  }
);

export function getDatabaseStatus(): boolean {
  return false;
}

export async function connectDatabase(): Promise<void> {
  logger.warn('Database is not available - running without database');
}

export async function disconnectDatabase(): Promise<void> {
  // no-op
}
