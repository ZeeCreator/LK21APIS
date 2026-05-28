import { streamResolver } from '../services/streamResolver';
import { logger } from '../utils/logger';

export class UrlExtractService {
  async extract(url: string) {
    logger.info({ url }, 'UrlExtractService');
    const result = await streamResolver.resolve(url);
    return result;
  }
}

export const urlExtractService = new UrlExtractService();
