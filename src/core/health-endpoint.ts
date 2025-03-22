import { Logger } from '../utils/logger.js';
import { HealthChecker, HealthStatus } from '../utils/health.js';
import { McpServer, McpToolResponse } from '../types/mcp.js';

export function registerHealthEndpoint(
  server: McpServer,
  healthChecker: HealthChecker,
  logger: Logger
): void {
  server.registerTool({
    name: 'health',
    description: 'Get system health status',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const status: HealthStatus = await healthChecker.check();

        return {
          success: true,
          data: status,
        };
      } catch (error) {
        logger.error('Health check failed', { error });

        return {
          success: false,
          error: 'Health check failed',
        };
      }
    },
  });

  server.registerTool({
    name: 'health.components',
    description: 'Get components health status',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const status = await healthChecker.check();

        return {
          success: true,
          data: status.components,
        };
      } catch (error) {
        logger.error('Components health check failed', { error });

        return {
          success: false,
          error: 'Components health check failed',
        };
      }
    },
  });

  server.registerTool({
    name: 'health.integrations',
    description: 'Get integrations health status',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const status = await healthChecker.check();

        return {
          success: true,
          data: status.integrations,
        };
      } catch (error) {
        logger.error('Integrations health check failed', { error });

        return {
          success: false,
          error: 'Integrations health check failed',
        };
      }
    },
  });

  server.registerTool({
    name: 'health.tasks',
    description: 'Get tasks health status',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const status = await healthChecker.check();

        return {
          success: true,
          data: status.tasks,
        };
      } catch (error) {
        logger.error('Tasks health check failed', { error });

        return {
          success: false,
          error: 'Tasks health check failed',
        };
      }
    },
  });

  server.registerTool({
    name: 'health.memory',
    description: 'Get memory usage status',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const status = await healthChecker.check();

        return {
          success: true,
          data: status.memory,
        };
      } catch (error) {
        logger.error('Memory health check failed', { error });

        return {
          success: false,
          error: 'Memory health check failed',
        };
      }
    },
  });
}
