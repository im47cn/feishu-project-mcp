import {
  McpServer,
  McpToolResponse,
  ProjectIdParam,
  TaskIdParam,
  CreateTaskParam,
  ItemParam,
} from '../types/mcp.js';
import { Logger } from '../utils/logger.js';
import { FeishuIntegrator } from '../integrators/feishu.js';
import { TaskManager } from '../managers/task.js';
import { Task, TaskType, TaskStatus } from '../types/task.js';
import { v4 as uuidv4 } from 'uuid';

export function registerFeishuTools(
  server: McpServer,
  feishu: FeishuIntegrator,
  logger: Logger
): void {
  server.registerTool({
    name: 'feishu.projects',
    description: 'Get list of Feishu projects',
    parameters: [],
    execute: async (): Promise<McpToolResponse> => {
      try {
        const projects = await feishu.getProjects();

        return {
          success: true,
          data: projects,
        };
      } catch (error) {
        logger.error('Failed to get Feishu projects', { error });

        return {
          success: false,
          error: 'Failed to get Feishu projects',
        };
      }
    },
  });

  server.registerTool<ProjectIdParam>({
    name: 'feishu.requirements',
    description: 'Get requirements for a project',
    parameters: [
      {
        name: 'projectId',
        description: 'Project ID',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: ProjectIdParam): Promise<McpToolResponse> => {
      try {
        const requirements = await feishu.getRequirements(params.projectId);

        return {
          success: true,
          data: requirements,
        };
      } catch (error) {
        logger.error('Failed to get requirements', { error, projectId: params.projectId });

        return {
          success: false,
          error: 'Failed to get requirements',
        };
      }
    },
  });

  server.registerTool<ProjectIdParam>({
    name: 'feishu.bugs',
    description: 'Get bugs for a project',
    parameters: [
      {
        name: 'projectId',
        description: 'Project ID',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: ProjectIdParam): Promise<McpToolResponse> => {
      try {
        const bugs = await feishu.getBugs(params.projectId);

        return {
          success: true,
          data: bugs,
        };
      } catch (error) {
        logger.error('Failed to get bugs', { error, projectId: params.projectId });

        return {
          success: false,
          error: 'Failed to get bugs',
        };
      }
    },
  });
}

export function registerTaskTools(
  server: McpServer,
  taskManager: TaskManager,
  logger: Logger
): void {
  server.registerTool<CreateTaskParam>({
    name: 'task.create',
    description: 'Create a new task',
    parameters: [
      {
        name: 'type',
        description: 'Task type',
        type: 'string',
        required: true,
      },
      {
        name: 'itemId',
        description: 'Item ID',
        type: 'string',
        required: true,
      },
      {
        name: 'itemType',
        description: 'Item type',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: CreateTaskParam): Promise<McpToolResponse> => {
      try {
        const task: Task = {
          id: uuidv4(),
          type: params.type as TaskType,
          status: TaskStatus.PENDING,
          itemId: params.itemId,
          itemType: params.itemType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const createdTask = await taskManager.createTask(task);

        return {
          success: true,
          data: createdTask,
        };
      } catch (error) {
        logger.error('Failed to create task', { error, params });

        return {
          success: false,
          error: 'Failed to create task',
        };
      }
    },
  });

  server.registerTool<TaskIdParam>({
    name: 'task.get',
    description: 'Get task details',
    parameters: [
      {
        name: 'taskId',
        description: 'Task ID',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: TaskIdParam): Promise<McpToolResponse> => {
      try {
        const task = await taskManager.getTask(params.taskId);

        if (!task) {
          return {
            success: false,
            error: 'Task not found',
          };
        }

        return {
          success: true,
          data: task,
        };
      } catch (error) {
        logger.error('Failed to get task', { error, taskId: params.taskId });

        return {
          success: false,
          error: 'Failed to get task',
        };
      }
    },
  });
}

export function registerModeTools(
  server: McpServer,
  taskManager: TaskManager,
  logger: Logger
): void {
  server.registerTool<ItemParam>({
    name: 'mode.analyze',
    description: 'Analyze a requirement or bug',
    parameters: [
      {
        name: 'itemId',
        description: 'Item ID',
        type: 'string',
        required: true,
      },
      {
        name: 'itemType',
        description: 'Item type (requirement or bug)',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: ItemParam): Promise<McpToolResponse> => {
      try {
        const task: Task = {
          id: uuidv4(),
          type: TaskType.REQUIREMENT_ANALYSIS,
          status: TaskStatus.PENDING,
          itemId: params.itemId,
          itemType: params.itemType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const createdTask = await taskManager.createTask(task);

        return {
          success: true,
          data: createdTask,
        };
      } catch (error) {
        logger.error('Failed to start analysis', { error, params });

        return {
          success: false,
          error: 'Failed to start analysis',
        };
      }
    },
  });

  server.registerTool<ItemParam>({
    name: 'mode.implement',
    description: 'Implement a requirement or bug fix',
    parameters: [
      {
        name: 'itemId',
        description: 'Item ID',
        type: 'string',
        required: true,
      },
      {
        name: 'itemType',
        description: 'Item type (requirement or bug)',
        type: 'string',
        required: true,
      },
    ],
    execute: async (params: ItemParam): Promise<McpToolResponse> => {
      try {
        const task: Task = {
          id: uuidv4(),
          type: TaskType.CODE_IMPLEMENTATION,
          status: TaskStatus.PENDING,
          itemId: params.itemId,
          itemType: params.itemType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const createdTask = await taskManager.createTask(task);

        return {
          success: true,
          data: createdTask,
        };
      } catch (error) {
        logger.error('Failed to start implementation', { error, params });

        return {
          success: false,
          error: 'Failed to start implementation',
        };
      }
    },
  });
}
