import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';
import { logger } from './logger';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: baseURL || env.SCRAPER_BASE_URL,
      timeout: env.SCRAPER_TIMEOUT,
      headers: {
        'User-Agent': env.SCRAPER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      decompress: true,
      maxRedirects: 5,
    };

    if (env.SCRAPER_PROXY_URL) {
      try {
        const proxyUrl = new URL(env.SCRAPER_PROXY_URL);
        axiosConfig.proxy = {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port, 10) || 8080,
          protocol: proxyUrl.protocol.replace(':', '') as 'http' | 'https',
          auth:
            proxyUrl.username
              ? { username: proxyUrl.username, password: proxyUrl.password }
              : undefined,
        };
        logger.info({ proxy: env.SCRAPER_PROXY_URL }, 'Using proxy for HTTP client');
      } catch {
        logger.warn({ proxyUrl: env.SCRAPER_PROXY_URL }, 'Invalid SCRAPER_PROXY_URL, ignoring');
      }
    }

    this.client = axios.create(axiosConfig);

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        logger.error({ err: error }, `HTTP request failed`);
        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async getHTML(url: string, headers?: Record<string, string>): Promise<string> {
    const response = await this.client.get<string>(url, {
      responseType: 'text',
      headers,
    });
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  get axiosInstance(): AxiosInstance {
    return this.client;
  }
}
