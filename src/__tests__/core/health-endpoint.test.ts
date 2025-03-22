import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HealthChecker, HealthStatus } from '../../utils/health';
import { Logger, LogLevel } from '../../utils/logger';
import { registerHealthEndpoint } from '../../core/health-endpoint';

jest.mock('@modelcontextprotocol/sdk/server/mcp.js');
jest.mock('../../utils/health');
jest.mock('../../utils/logger');

describe('Health Endpoint', () => {
  let server: jest.Mocked<McpServer>;
  let healthChecker: jest.Mocked<HealthChecker>;
  let logger: jest.Mocked<Logger>;
  let toolHandler: (args: any) => Promise<any>;
  let mockHealthyStatus: HealthStatus;

  beforeEach(() => {
    // Create mock instances
    server = new McpServer({ name: 'test', version: '1.0.0' }) as jest.Mocked<McpServer>;
    healthChecker = new HealthChecker(
      '1.0.0',
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<HealthChecker>;
    logger = new Logger({ level: LogLevel.INFO, directory: './logs' }) as jest.Mocked<Logger>;

    // Set up mock healthy status
    mockHealthyStatus = {
      status: 'healthy',
      version: '1.0.0',
      timestamp: '2025-03-22T09:00:00.000Z',
      uptime: 3665, // 1h 1m 5s
      memory: {
        heapTotal: 100,
        heapUsed: 50,
        rss: 200,
        external: 10,
      },
      tasks: {
        running: 2,
        total: 5,
      },
      integrations: {
        feishu: true,
      },
      components: {
        storage: true,
        logs: true,
      },
    };

    // Mock server.tool to capture the handler
    server.tool = jest.fn().mockImplementation((name, description, schema, handler) => {
      toolHandler = handler;
    });

    // Register health endpoint
    registerHealthEndpoint(server, healthChecker, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register health tool with correct name and description', () => {
    expect(server.tool).toHaveBeenCalledWith(
      'health',
      'Get service health status',
      expect.any(Object),
      expect.any(Function)
    );
  });

  describe('Health Check Response', () => {
    beforeEach(() => {
      healthChecker.check = jest.fn().mockResolvedValue(mockHealthyStatus);
    });

    it('should return formatted health status when healthy', async () => {
      const response = await toolHandler({});
      const result = JSON.parse(response.content[0].text);

      expect(result).toEqual({
        status: 'healthy',
        version: '1.0.0',
        timestamp: '2025-03-22T09:00:00.000Z',
        checks: {
          feishu: {
            status: 'up',
          },
          storage: {
            status: 'up',
          },
          logs: {
            status: 'up',
          },
          tasks: {
            status: 'up',
            details: {
              running: 2,
              total: 5,
            },
          },
          memory: {
            status: 'up',
            details: {
              heapTotal: 100,
              heapUsed: 50,
              rss: 200,
              external: 10,
              unit: 'MB',
            },
          },
        },
        uptime: {
          seconds: 3665,
          formatted: '1h 1m 5s',
        },
      });
    });

    it('should handle unhealthy status', async () => {
      const unhealthyStatus: HealthStatus = {
        ...mockHealthyStatus,
        status: 'unhealthy',
        integrations: {
          feishu: false,
        },
        components: {
          storage: false,
          logs: true,
        },
      };

      healthChecker.check = jest.fn().mockResolvedValue(unhealthyStatus);

      const response = await toolHandler({});
      const result = JSON.parse(response.content[0].text);

      expect(result.status).toBe('unhealthy');
      expect(result.checks.feishu.status).toBe('down');
      expect(result.checks.storage.status).toBe('down');
      expect(result.checks.logs.status).toBe('up');
    });

    it('should log health check results', async () => {
      await toolHandler({});

      expect(logger.info).toHaveBeenCalledWith(
        'Health check succeeded',
        expect.objectContaining({
          uptime: mockHealthyStatus.uptime,
          runningTasks: mockHealthyStatus.tasks.running,
        })
      );
    });

    it('should log warnings for unhealthy status', async () => {
      const unhealthyStatus: HealthStatus = {
        ...mockHealthyStatus,
        status: 'unhealthy',
      };
      healthChecker.check = jest.fn().mockResolvedValue(unhealthyStatus);

      await toolHandler({});

      expect(logger.warn).toHaveBeenCalledWith(
        'Health check failed',
        expect.objectContaining({
          status: unhealthyStatus,
        })
      );
    });

    it('should handle and log errors', async () => {
      const error = new Error('Health check failed');
      healthChecker.check = jest.fn().mockRejectedValue(error);

      await expect(toolHandler({})).rejects.toThrow(error);

      expect(logger.error).toHaveBeenCalledWith(
        'Health check endpoint error',
        expect.objectContaining({
          error,
        })
      );
    });
  });

  describe('Uptime Formatting', () => {
    it('should format uptime correctly for various durations', async () => {
      const testCases = [
        { seconds: 30, expected: '30s' },
        { seconds: 65, expected: '1m 5s' },
        { seconds: 3665, expected: '1h 1m 5s' },
        { seconds: 90000, expected: '1d 1h' },
        { seconds: 0, expected: '0s' },
      ];

      for (const { seconds, expected } of testCases) {
        healthChecker.check = jest.fn().mockResolvedValue({
          ...mockHealthyStatus,
          uptime: seconds,
        });

        const response = await toolHandler({});
        const result = JSON.parse(response.content[0].text);

        expect(result.uptime.formatted).toBe(expected);
      }
    });
  });
});
