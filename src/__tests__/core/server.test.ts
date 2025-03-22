import * as fs from 'fs';
import * as path from 'path';
import { McpService } from '../../core/server';
import { FeishuIntegrator } from '../../integrators/feishu';
import { TaskManager } from '../../managers/task';
import { FeishuItemType } from '../../types/feishu';
import { TaskStatus } from '../../types/task';
import { McpServiceConfig } from '../../utils/config';
import { Logger } from '../../utils/logger';

jest.mock('../../integrators/feishu');
jest.mock('../../managers/task');
jest.mock('../../utils/logger');

describe('McpService', () => {
  let service: McpService;
  let config: McpServiceConfig;
  let logger: jest.Mocked<Logger>;
  let tempDir: string;

  beforeEach(() => {
    // Create temporary directories for testing
    tempDir = fs.mkdtempSync('mcp-test-');
    const storageDir = path.join(tempDir, 'storage');
    const logDir = path.join(tempDir, 'logs');
    fs.mkdirSync(storageDir);
    fs.mkdirSync(logDir);

    // Mock configuration
    config = {
      name: 'test-mcp-service',
      version: '1.0.0',
      feishuToken: 'test-token',
      storageDir,
      logDir,
      logLevel: LogLevel.INFO,
      maxConcurrentTasks: 5,
      checkInterval: 1000,
    };

    // Mock logger
    logger = new Logger({ level: LogLevel.INFO, directory: logDir }) as jest.Mocked<Logger>;

    // Create service instance
    service = new McpService(config, logger);
  });

  afterEach(() => {
    // Clean up temporary directories
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await service.initialize();
      expect(logger.info).toHaveBeenCalledWith('Initializing MCP service', {
        name: config.name,
        version: config.version,
      });
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      jest.spyOn(service as any, 'registerTools').mockImplementation(() => {
        throw error;
      });

      await expect(service.initialize()).rejects.toThrow(error);
    });
  });

  describe('start and stop', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should start and stop service successfully', async () => {
      await service.start();
      expect(logger.info).toHaveBeenCalledWith('MCP service started', {
        checkInterval: config.checkInterval,
      });

      await service.stop();
      expect(logger.info).toHaveBeenCalledWith('MCP service stopped');
    });

    it('should not start service twice', async () => {
      await service.start();
      const startCount = (logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'MCP service started'
      ).length;

      await service.start();
      expect(startCount).toBe(1);
    });

    it('should handle start errors', async () => {
      const error = new Error('Start failed');
      jest.spyOn(service as any, 'processMcpMessages').mockImplementation(() => {
        throw error;
      });

      await expect(service.start()).rejects.toThrow(error);
    });
  });

  describe('project checking', () => {
    let feishuIntegrator: jest.Mocked<FeishuIntegrator>;
    let taskManager: jest.Mocked<TaskManager>;

    beforeEach(() => {
      feishuIntegrator = service['feishuIntegrator'] as jest.Mocked<FeishuIntegrator>;
      taskManager = service['taskManager'] as jest.Mocked<TaskManager>;

      const now = new Date().toISOString();

      feishuIntegrator.getProjects.mockResolvedValue([
        {
          id: 'project1',
          name: 'Test Project',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      feishuIntegrator.getRequirements.mockResolvedValue([
        {
          id: 'req1',
          title: 'Test Requirement',
          type: FeishuItemType.REQUIREMENT,
          status: 'open',
          creator: 'user1',
          projectId: 'project1',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      feishuIntegrator.getBugs.mockResolvedValue([
        {
          id: 'bug1',
          title: 'Test Bug',
          type: FeishuItemType.BUG,
          severity: 'high',
          status: 'open',
          creator: 'user1',
          projectId: 'project1',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      taskManager.canCreateNewTask.mockResolvedValue(true);
      taskManager.createTask.mockImplementation(async (type, itemId, itemType) => ({
        id: `task_${itemId}`,
        type,
        status: TaskStatus.CREATED,
        itemId,
        itemType,
        createdAt: now,
        updatedAt: now,
      }));
    });

    it('should check projects and create tasks', async () => {
      await service['checkFeishuProjects']();

      expect(feishuIntegrator.getProjects).toHaveBeenCalled();
      expect(feishuIntegrator.getRequirements).toHaveBeenCalledWith('project1');
      expect(feishuIntegrator.getBugs).toHaveBeenCalledWith('project1');
      expect(taskManager.createTask).toHaveBeenCalledTimes(2);
    });

    it('should handle project check errors', async () => {
      const error = new Error('API error');
      feishuIntegrator.getProjects.mockRejectedValue(error);

      await expect(service['checkFeishuProjects']()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Error checking Feishu projects', { error });
    });

    it('should respect max concurrent tasks limit', async () => {
      taskManager.canCreateNewTask.mockResolvedValue(false);
      await service['checkFeishuProjects']();

      expect(taskManager.createTask).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Cannot process item: maximum concurrent tasks reached',
        expect.any(Object)
      );
    });
  });
});
