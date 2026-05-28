import { env } from '../config/env';
import { logger } from '../utils/logger';

let PrismaClient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  // Prisma Client not generated or not available
}

let isDatabaseConnected = false;

function createPrisma(): any {
  if (!PrismaClient) return null;
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: any = new Proxy(
  {},
  {
    get(_, prop) {
      const client = createPrisma();
      if (!client) throw new Error('Database not available');
      return (client as any)[prop];
    },
  }
);

export function getDatabaseStatus(): boolean {
  return isDatabaseConnected;
}

export async function connectDatabase(): Promise<void> {
  const client = createPrisma();
  if (!client) {
    logger.warn('Database is not available - running without database');
    isDatabaseConnected = false;
    return;
  }
  try {
    await client.$connect();
    isDatabaseConnected = true;
    logger.info('Database connected successfully');
  } catch {
    logger.warn('Database is not available - running without database');
    isDatabaseConnected = false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  const client = createPrisma();
  if (!client) return;
  try {
    await client.$disconnect();
  } catch {
    // ignore
  }
  isDatabaseConnected = false;
  logger.info('Database disconnected');
}
