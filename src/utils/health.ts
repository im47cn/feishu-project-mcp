import { Logger } from './logger.js';
import { TaskManager } from '../managers/task.js';
import { FeishuIntegrator } from '../integrators/feishu.js';
import { TaskStatus } from '../types/task.js';
import os from 'os';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  timestamp: string;
  uptime: number;
  components: ComponentHealth;
  integrations: IntegrationHealth;
  tasks: TaskHealth;
  memory: MemoryHealth;
}

export interface ComponentHealth {
  server: ComponentStatus;
  taskManager: ComponentStatus;
  storage: ComponentStatus;
}

export interface IntegrationHealth {
  feishu: ComponentStatus;
}

export interface TaskHealth {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

export interface MemoryHealth {
  heapUsed: number;
  heapTotal: number;
  external: number;
  systemTotal: number;
  systemFree: number;
  systemUsagePercent: number;
}

export interface ComponentStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  message?: string;
}

export class HealthChecker {
  private version: string;
  private logger: Logger;
  private taskManager: TaskManager;
  private feishuIntegrator: FeishuIntegrator;
  private startTime: number;

  constructor(
    version: string,
    logger: Logger,
    taskManager: TaskManager,
    feishuIntegrator: FeishuIntegrator
  ) {
    this.version = version;
    this.logger = logger;
    this.taskManager = taskManager;
    this.feishuIntegrator = feishuIntegrator;
    this.startTime = Date.now();
  }

  public async check(): Promise<HealthStatus> {
    try {
      const [componentHealth, integrationHealth, taskHealth, memoryHealth] = await Promise.all([
        this.checkComponents(),
        this.checkIntegrations(),
        this.checkTasks(),
        this.checkMemory(),
      ]);

      const status = this.determineOverallStatus(componentHealth, integrationHealth, taskHealth);

      return {
        status,
        version: this.version,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        components: componentHealth,
        integrations: integrationHealth,
        tasks: taskHealth,
        memory: memoryHealth,
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      throw error;
    }
  }

  private async checkComponents(): Promise<ComponentHealth> {
    const now = new Date().toISOString();

    return {
      server: {
        status: 'healthy',
        lastCheck: now,
      },
      taskManager: {
        status: 'healthy',
        lastCheck: now,
      },
      storage: {
        status: await this.checkStorage(),
        lastCheck: now,
      },
    };
  }

  private async checkIntegrations(): Promise<IntegrationHealth> {
    return {
      feishu: {
        status: await this.checkFeishuIntegration(),
        lastCheck: new Date().toISOString(),
      },
    };
  }

  private async checkTasks(): Promise<TaskHealth> {
    try {
      const tasks = await this.taskManager.getTasks();

      return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        failed: tasks.filter(t => t.status === TaskStatus.FAILED).length,
      };
    } catch (error) {
      this.logger.error('Failed to check tasks health', { error });

      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
      };
    }
  }

  private checkMemory(): MemoryHealth {
    const memory = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
    };

    return {
      heapUsed: Math.floor(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.floor(memory.heapTotal / 1024 / 1024),
      external: Math.floor(memory.external / 1024 / 1024),
      systemTotal: Math.floor(systemMemory.total / 1024 / 1024),
      systemFree: Math.floor(systemMemory.free / 1024 / 1024),
      systemUsagePercent: Math.floor(
        ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100
      ),
    };
  }

  private async checkStorage(): Promise<'healthy' | 'unhealthy' | 'degraded'> {
    try {
      // Just check if we can get tasks
      await this.taskManager.getTasks();

      return 'healthy';
    } catch (error) {
      this.logger.error('Storage health check failed', { error });

      return 'unhealthy';
    }
  }

  private async checkFeishuIntegration(): Promise<'healthy' | 'unhealthy' | 'degraded'> {
    try {
      await this.feishuIntegrator.getProjects();

      return 'healthy';
    } catch (error) {
      this.logger.error('Feishu integration health check failed', { error });

      return 'unhealthy';
    }
  }

  private determineOverallStatus(
    components: ComponentHealth,
    integrations: IntegrationHealth,
    tasks: TaskHealth
  ): 'healthy' | 'unhealthy' | 'degraded' {
    // Check for any unhealthy components
    if (
      components.server.status === 'unhealthy' ||
      components.taskManager.status === 'unhealthy' ||
      components.storage.status === 'unhealthy' ||
      integrations.feishu.status === 'unhealthy'
    ) {
      return 'unhealthy';
    }

    // Check for any degraded components
    if (
      components.server.status === 'degraded' ||
      components.taskManager.status === 'degraded' ||
      components.storage.status === 'degraded' ||
      integrations.feishu.status === 'degraded'
    ) {
      return 'degraded';
    }

    // Check task health
    if (tasks.failed > 0) {
      return 'degraded';
    }

    return 'healthy';
  }
}
