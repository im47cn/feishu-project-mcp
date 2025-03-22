import express from 'express';
import { Logger } from '../utils/logger.js';
import { FeishuIntegrator, FeishuIntegratorConfig } from '../integrators/feishu.js';
import { TaskManager } from '../managers/task.js';
import { HealthChecker } from '../utils/health.js';
import { registerFeishuTools, registerTaskTools, registerModeTools } from './tools.js';
import { registerHealthEndpoint } from './health-endpoint.js';
import { McpServer, McpTool, McpToolResponse } from '../types/mcp.js';

export interface ServerConfig {
  port: number;
  host: string;
  version: string;
  name: string;
  feishu: FeishuIntegratorConfig;
  storage: {
    dir: string;
    maxConcurrentTasks: number;
  };
}

export class McpService {
  private expressApp: express.Application;
  private server: any;
  private mcpServer: McpServer;
  private logger: Logger;
  private feishuIntegrator: FeishuIntegrator;
  private taskManager: TaskManager;
  private healthChecker: HealthChecker;
  private config: ServerConfig;
  private isServerRunning: boolean = false;
  private tools: Map<string, McpTool<any>> = new Map();

  constructor(config: ServerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;

    // Initialize Express app
    this.expressApp = express();
    this.expressApp.use(express.json());

    // Setup basic routes
    this.expressApp.get('/health', async (req, res) => {
      try {
        const status = await this.healthChecker.check();

        res.json(status);
      } catch (error) {
        this.logger.error('Health check failed', { error });
        res.status(500).json({ status: 'unhealthy', error: 'Health check failed' });
      }
    });

    // Setup MCP endpoint
    this.expressApp.post('/mcp', async (req, res) => {
      try {
        const { tool, params } = req.body;

        if (!tool) {
          return res.status(400).json({
            success: false,
            error: 'Tool name is required',
          });
        }

        const toolHandler = this.tools.get(tool);

        if (!toolHandler) {
          return res.status(404).json({
            success: false,
            error: `Tool '${tool}' not found`,
          });
        }

        const result = await toolHandler.execute(params || {});

        return res.json(result);
      } catch (error) {
        this.logger.error('Tool execution failed', { error });

        return res.status(500).json({
          success: false,
          error: 'Tool execution failed',
        });
      }
    });

    // Create MCP server adapter
    this.mcpServer = {
      registerTool: <T>(tool: McpTool<T>) => {
        this.tools.set(tool.name, tool);
        this.logger.debug(`Tool registered: ${tool.name}`);
      },
      start: async () => {
        return new Promise<void>(resolve => {
          this.server = this.expressApp.listen(this.config.port, this.config.host, () => {
            this.isServerRunning = true;
            resolve();
          });
        });
      },
      stop: async () => {
        return new Promise<void>((resolve, reject) => {
          if (this.server) {
            this.server.close((err: any) => {
              if (err) {
                reject(err);
              } else {
                this.isServerRunning = false;
                resolve();
              }
            });
          } else {
            this.isServerRunning = false;
            resolve();
          }
        });
      },
      isRunning: () => this.isServerRunning,
      getPort: () => this.config.port,
      getHost: () => this.config.host,
    };

    // Initialize integrators and managers
    this.feishuIntegrator = new FeishuIntegrator(config.feishu, logger);

    this.taskManager = new TaskManager(
      {
        storageDir: config.storage.dir,
        maxConcurrentTasks: config.storage.maxConcurrentTasks,
      },
      logger
    );

    this.healthChecker = new HealthChecker(
      config.version,
      logger,
      this.taskManager,
      this.feishuIntegrator
    );
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing MCP service...');

      // Initialize Feishu integrator
      await this.feishuIntegrator.initialize();

      // Initialize task manager
      await this.taskManager.initialize();

      // Register tools
      this.registerTools();

      this.logger.info('MCP service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP service', { error });
      throw error;
    }
  }

  private registerTools(): void {
    this.logger.info('Registering MCP tools...');

    // Register all tools
    registerFeishuTools(this.mcpServer, this.feishuIntegrator, this.logger);
    registerTaskTools(this.mcpServer, this.taskManager, this.logger);
    registerModeTools(this.mcpServer, this.taskManager, this.logger);
    registerHealthEndpoint(this.mcpServer, this.healthChecker, this.logger);

    this.logger.info('MCP tools registered successfully');
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('Starting MCP service...');
      await this.mcpServer.start();
      this.logger.info(`MCP service is running on ${this.config.host}:${this.config.port}`);
    } catch (error) {
      this.logger.error('Failed to start MCP service', { error });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.logger.info('Stopping MCP service...');
      await this.mcpServer.stop();
      this.logger.info('MCP service stopped successfully');
    } catch (error) {
      this.logger.error('Failed to stop MCP service', { error });
      throw error;
    }
  }

  public isRunning(): boolean {
    return this.mcpServer.isRunning();
  }

  public getPort(): number {
    return this.config.port;
  }

  public getHost(): string {
    return this.config.host;
  }
}
