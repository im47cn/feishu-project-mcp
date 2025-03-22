import { HealthChecker, HealthStatus } from '../../utils/health';
import { Logger } from '../../utils/logger';
import { TaskManager } from '../../managers/task';
import { FeishuIntegrator } from '../../integrators/feishu';
import { TaskStatus } from '../../types/task';

// Mock dependencies
jest.mock('../../utils/logger');
jest.mock('../../managers/task');
jest.mock('../../integrators/feishu');

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;
  let mockLogger: jest.Mocked<Logger>;
  let mockTaskManager: jest.Mocked<TaskManager>;
  let mockFeishuIntegrator: jest.Mocked<FeishuIntegrator>;

  beforeEach(() => {
    // Create mock instances
    mockLogger = new Logger({
      level: 'info',
      logDir: './logs',
      serviceName: 'test',
    }) as jest.Mocked<Logger>;

    mockTaskManager = new TaskManager(
      {
        storageDir: './storage',
        maxConcurrentTasks: 5,
      },
      mockLogger
    ) as jest.Mocked<TaskManager>;

    mockFeishuIntegrator = new FeishuIntegrator(
      {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        apiUrl: 'https://test-api.feishu.cn',
      },
      mockLogger
    ) as jest.Mocked<FeishuIntegrator>;

    // Setup mock implementations
    mockTaskManager.getStorageDir = jest.fn().mockReturnValue('./storage');
    mockTaskManager.getTasks = jest.fn().mockResolvedValue([
      {
        id: 'task1',
        type: 'requirement_analysis',
        status: TaskStatus.PENDING,
        itemId: 'item1',
        itemType: 'requirement',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task2',
        type: 'code_implementation',
        status: TaskStatus.IN_PROGRESS,
        itemId: 'item2',
        itemType: 'requirement',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task3',
        type: 'bug_analysis',
        status: TaskStatus.COMPLETED,
        itemId: 'item3',
        itemType: 'bug',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    ]);

    mockFeishuIntegrator.getProjects = jest.fn().mockResolvedValue([
      {
        id: 'project1',
        name: 'Test Project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner: {
          id: 'user1',
          name: 'Test User',
        },
        status: 'active',
      },
    ]);

    // Create health checker instance
    healthChecker = new HealthChecker('1.0.0', mockLogger, mockTaskManager, mockFeishuIntegrator);
  });

  describe('check', () => {
    it('should return a valid health status', async () => {
      const status = await healthChecker.check();

      expect(status).toBeDefined();
      expect(status.version).toBe('1.0.0');
      expect(status.status).toBe('healthy');
      expect(status.components).toBeDefined();
      expect(status.integrations).toBeDefined();
      expect(status.tasks).toBeDefined();
      expect(status.memory).toBeDefined();
    });

    it('should report correct task counts', async () => {
      const status = await healthChecker.check();

      expect(status.tasks.total).toBe(3);
      expect(status.tasks.pending).toBe(1);
      expect(status.tasks.inProgress).toBe(1);
      expect(status.tasks.completed).toBe(1);
      expect(status.tasks.failed).toBe(0);
    });

    it('should report degraded status when Feishu integration fails', async () => {
      mockFeishuIntegrator.getProjects = jest.fn().mockRejectedValue(new Error('API error'));

      const status = await healthChecker.check();

      expect(status.status).toBe('degraded');
      expect(status.integrations.feishu.status).toBe('unhealthy');
    });

    it('should report unhealthy status when storage fails', async () => {
      mockTaskManager.getTasks = jest.fn().mockRejectedValue(new Error('Storage error'));

      const status = await healthChecker.check();

      expect(status.status).toBe('unhealthy');
      expect(status.components.storage.status).toBe('unhealthy');
    });
  });
});
