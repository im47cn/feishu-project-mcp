import { McpService } from './core/server.js';
import { Logger } from './utils/logger.js';
import { parseConfig } from './utils/config.js';
import fs from 'fs/promises';

async function main() {
  try {
    // Parse configuration
    const config = parseConfig(process.argv.slice(2));

    // Create logs directory if it doesn't exist
    const logDir = process.env.LOG_DIR || './logs';

    await fs.mkdir(logDir, { recursive: true });

    // Initialize logger
    const logger = new Logger({
      level: process.env.LOG_LEVEL || 'info',
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
}

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

// Start the application
main();
