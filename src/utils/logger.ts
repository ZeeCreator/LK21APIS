import pino from 'pino';
import { env } from '../config/env';

const isVercel = !!process.env.VERCEL;
const usePretty = env.LOG_PRETTY && !isVercel;

let stream: pino.DestinationStream | undefined;
if (usePretty) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pretty = require('pino-pretty');
    stream = pretty.default
      ? pretty.default({ colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' })
      : pretty({ colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' });
  } catch {
    // pino-pretty not available, fall back to JSON
  }
}

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    formatters: { level: (label) => ({ level: label.toUpperCase() }) },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  stream
);
