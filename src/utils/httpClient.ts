import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';
import { logger } from './logger';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || env.SCRAPER_BASE_URL,
      timeout: env.SCRAPER_TIMEOUT,
      headers: {
        'User-Agent': env.SCRAPER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

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
