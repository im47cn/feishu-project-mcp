#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import { McpService } from './core/server.js';
import { parseConfig } from './utils/config.js';
import { HealthStatus } from './utils/health.js';
import { Logger } from './utils/logger.js';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json
const packageJson = JSON.parse(await fs.readFile(join(__dirname, '../package.json'), 'utf8'));
const { version } = packageJson;

const program = new Command();

program.name('feishu-project-mcp').description('Feishu Project MCP Service').version(version);

program
  .command('start')
  .description('Start the MCP service')
  .option('-p, --port <port>', 'Port to listen on')
  .option('-h, --host <host>', 'Host to bind to')
  .option('--feishu-app-id <appId>', 'Feishu App ID')
  .option('--feishu-app-secret <appSecret>', 'Feishu App Secret')
  .option('--feishu-api-url <apiUrl>', 'Feishu API URL')
  .option('--storage-dir <dir>', 'Storage directory')
  .option('--log-dir <dir>', 'Log directory')
  .option('--log-level <level>', 'Log level (debug, info, warn, error)')
  .option('--max-concurrent-tasks <count>', 'Maximum concurrent tasks')
  .action(async options => {
    try {
      // Convert options to command line arguments
      const args: string[] = [];

      Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'string') {
          args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
          args.push(value);
        }
      });

      // Parse configuration
      const config = parseConfig(args);

      // Create logs directory if it doesn't exist
      const logDir = process.env.LOG_DIR || options.logDir || './logs';

      await fs.mkdir(logDir, { recursive: true });

      // Initialize logger
      const logger = new Logger({
        level: process.env.LOG_LEVEL || options.logLevel || 'info',
        logDir,
        serviceName: config.name,
      });

      logger.info('Starting Feishu Project MCP Service', {
        version: config.version,
        environment: process.env.NODE_ENV || 'development',
      });

      // Initialize MCP service
      const service = new McpService(config, logger);

      // Handle shutdown signals
      process.on('SIGINT', async () => {
        logger.info('Received SIGINT signal, shutting down...');
        await shutdown(service, logger);
      });

      process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM signal, shutting down...');
        await shutdown(service, logger);
      });

      // Initialize and start service
      await service.initialize();
      await service.start();

      logger.info(`Feishu Project MCP Service is running on ${config.host}:${config.port}`);
    } catch (error) {
      console.error('Failed to start service:', error);
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check the health of the service')
  .option('-p, --port <port>', 'Port to connect to', '3000')
  .option('-h, --host <host>', 'Host to connect to', 'localhost')
  .action(async options => {
    try {
      const response = await fetch(`http://${options.host}:${options.port}/health`);
      const health = (await response.json()) as HealthStatus;

      console.log(JSON.stringify(health, null, 2));
      process.exit(health.status === 'healthy' ? 0 : 1);
    } catch (error) {
      console.error('Health check failed:', error);
      process.exit(1);
    }
  });

program
  .command('version')
  .description('Show version information')
  .action(() => {
    console.log(`Feishu Project MCP Service v${version}`);
  });

async function shutdown(service: McpService, logger: Logger) {
  try {
    if (service.isRunning()) {
      await service.stop();
    }
    logger.info('Service shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', { error });
    process.exit(1);
  }
}

// Parse command line arguments
program.parse();
