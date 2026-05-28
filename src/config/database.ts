import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

let isDatabaseConnected = false;

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export function getDatabaseStatus(): boolean {
  return isDatabaseConnected;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    isDatabaseConnected = true;
    logger.info('Database connected successfully');
  } catch (error) {
    logger.warn('Database is not available - running without database');
    isDatabaseConnected = false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  isDatabaseConnected = false;
  logger.info('Database disconnected');
}
