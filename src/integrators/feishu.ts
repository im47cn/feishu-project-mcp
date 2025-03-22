import { Logger } from '../utils/logger.js';
import axios, { AxiosInstance } from 'axios';
import { FeishuProject, FeishuRequirement, FeishuBug } from '../types/feishu.js';

export interface FeishuIntegratorConfig {
  appId: string;
  appSecret: string;
  apiUrl: string;
}

export class FeishuIntegrator {
  private config: FeishuIntegratorConfig;
  private logger: Logger;
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: FeishuIntegratorConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.logger.debug('Initializing Feishu integrator with config', {
      appId: config.appId,
      apiUrl: config.apiUrl,
    });

    this.client = axios.create({
      baseURL: 'https://project.feishu.cn/open_api',
      timeout: 10000,
    });
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Feishu integrator...');
      await this.refreshAccessToken();
      this.logger.info('Feishu integrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Feishu integrator', { error });
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      this.logger.debug('Refreshing Feishu access token...');

      // 根据飞书API文档格式发送请求
      const response = await this.client.post('/authen/plugin_token', {
        plugin_id: this.config.appId,
        plugin_secret: this.config.appSecret,
        type: 0,
      });

      this.logger.debug('Token response received', {
        status: response.status,
        statusText: response.statusText,
      });

      // 根据飞书API响应格式解析结果
      if (response.data.error.code === 0) {
        this.accessToken = response.data.data.token;
        this.tokenExpiry = Date.now() + response.data.data.expire_time * 1000;
        this.logger.debug('Access token refreshed successfully', {
          expiresIn: response.data.data.expire_time,
        });
      } else {
        throw new Error(`Failed to get access token: ${response.data.error.msg}`);
      }
    } catch (error) {
      this.logger.error('Failed to refresh access token', { error });
      throw error;
    }
  }

  private async ensureAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }

    return this.accessToken!;
  }

  private async request<T>(method: string, path: string, data?: any): Promise<T> {
    try {
      const token = await this.ensureAccessToken();

      this.logger.debug('Making API request', { method, path });

      const response = await this.client.request({
        method,
        url: path,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('API request failed', { error, method, path });
      throw error;
    }
  }

  public async getProjects(): Promise<FeishuProject[]> {
    this.logger.info('Fetching projects from Feishu');
    const response = await this.request<{ data: { items: FeishuProject[] } }>(
      'GET',
      '/project/v1/projects'
    );

    return response.data.items;
  }

  public async getRequirements(projectId: string): Promise<FeishuRequirement[]> {
    this.logger.info('Fetching requirements for project', { projectId });
    const response = await this.request<{ data: { items: FeishuRequirement[] } }>(
      'GET',
      `/project/v1/projects/${projectId}/requirements`
    );

    return response.data.items;
  }

  public async getBugs(projectId: string): Promise<FeishuBug[]> {
    this.logger.info('Fetching bugs for project', { projectId });
    const response = await this.request<{ data: { items: FeishuBug[] } }>(
      'GET',
      `/project/v1/projects/${projectId}/bugs`
    );

    return response.data.items;
  }

  public async updateItemStatus(itemId: string, status: string): Promise<void> {
    this.logger.info('Updating item status', { itemId, status });
    await this.request('PATCH', `/project/v1/items/${itemId}`, { status });
  }

  public async addComment(itemId: string, content: string): Promise<void> {
    this.logger.info('Adding comment to item', { itemId });
    await this.request('POST', `/project/v1/items/${itemId}/comments`, { content });
  }
}
