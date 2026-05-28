import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { registerRoutes } from './routes';
import { setupSwagger } from './docs/swagger';
import { startScheduler, stopScheduler } from './jobs';

async function buildApp() {
  const app = Fastify({
    logger: false,
    bodyLimit: 10 * 1024 * 1024,
    requestTimeout: 30000,
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (_request, context) => {
      return {
        success: false,
        code: 429,
        message: `Too many requests. Rate limit exceeded, retry in ${Math.ceil((context.ttl || 60000) / 1000)} seconds`,
      };
    },
  });

  // Swagger documentation
  await setupSwagger(app);

  // Health check
  app.get('/health', async () => {
    return {
      success: true,
      code: 200,
      message: 'OK',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  });

  // API Routes
  await registerRoutes(app);

  return app;
}

async function start() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();

    // Build app
    const app = await buildApp();

    // Start scheduler
    startScheduler();

    // Start server
    await app.listen({
      port: env.APP_PORT,
      host: env.APP_HOST,
    });

    logger.info(`
    ╔═══════════════════════════════════════════╗
    ║         DutaMovie API Server              ║
    ╠═══════════════════════════════════════════╣
    ║ Name:     ${env.APP_NAME.padEnd(28)}║
    ║ Port:     ${String(env.APP_PORT).padEnd(28)}║
    ║ Env:      ${env.NODE_ENV.padEnd(28)}║
    ║ Docs:     http://localhost:${String(env.APP_PORT).padEnd(17)}/docs ║
    ║ Health:   http://localhost:${String(env.APP_PORT).padEnd(17)}/health║
    ╚═══════════════════════════════════════════╝
    `);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  await stopScheduler();
  await disconnectRedis();
  await disconnectDatabase();
  
  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled Promise Rejection');
});
process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  start();
}

export { buildApp };

// Vercel serverless handler
let cachedApp: Awaited<ReturnType<typeof buildApp>> | null = null;
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    await connectDatabase();
    cachedApp = await buildApp();
    await cachedApp.ready();
  }
  cachedApp.server.emit('request', req, res);
}
