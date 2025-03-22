import { Task, TaskStatus, TaskType, TaskFilter, TaskManagerConfig } from '../types/task.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';

export class TaskManager {
  private config: TaskManagerConfig;
  private logger: Logger;
  private tasksDir: string;
  private activeTasksMap: Map<string, Task> = new Map();

  constructor(config: TaskManagerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.tasksDir = path.join(config.storageDir, 'tasks');
  }

  /**
   * 初始化任务管理器
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing TaskManager...');

      // 确保任务存储目录存在
      await fs.mkdir(this.tasksDir, { recursive: true });

      this.logger.info('TaskManager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize TaskManager', { error });
      throw error;
    }
  }

  /**
   * 创建新任务
   * @param task 任务对象
   * @returns 创建的任务
   */
  public async createTask(task: Task): Promise<Task> {
    try {
      // 如果没有提供ID，生成一个新的UUID
      if (!task.id) {
        task.id = uuidv4();
      }

      // 设置创建和更新时间
      task.created_at = task.created_at || new Date().toISOString();
      task.updated_at = task.updated_at || task.created_at;

      // 保存任务到文件系统
      await this.saveTask(task);

      // 如果任务状态为进行中，添加到活动任务映射
      if (task.status === TaskStatus.IN_PROGRESS) {
        this.activeTasksMap.set(task.id, task);
      }

      this.logger.info('Task created', { taskId: task.id, type: task.type });

      return task;
    } catch (error) {
      this.logger.error('Failed to create task', { taskData: task, error });
      throw error;
    }
  }

  /**
   * 更新任务
   * @param taskId 任务ID
   * @param updates 更新的字段
   * @returns 更新后的任务
   */
  public async updateTask(taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    try {
      // 获取当前任务
      const currentTask = await this.getTask(taskId);

      // 更新任务字段
      const updatedTask: Task = {
        ...currentTask,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // 如果状态改变，更新相应的状态时间戳
      if (updates.status && updates.status !== currentTask.status) {
        switch (updates.status) {
          case TaskStatus.COMPLETED:
            updatedTask.completed_at = updatedTask.updated_at;
            break;
          case TaskStatus.FAILED:
            updatedTask.failed_at = updatedTask.updated_at;
            break;
          case TaskStatus.CANCELLED:
            updatedTask.cancelled_at = updatedTask.updated_at;
            break;
        }
      }

      // 保存更新后的任务
      await this.saveTask(updatedTask);

      // 更新活动任务映射
      if (updatedTask.status === TaskStatus.IN_PROGRESS) {
        this.activeTasksMap.set(taskId, updatedTask);
      } else {
        this.activeTasksMap.delete(taskId);
      }

      this.logger.info('Task updated', { taskId, updates });

      return updatedTask;
    } catch (error) {
      this.logger.error('Failed to update task', { taskId, updates, error });
      throw error;
    }
  }

  /**
   * 获取任务
   * @param taskId 任务ID
   * @returns 任务对象
   */
  public async getTask(taskId: string): Promise<Task> {
    try {
      const filePath = path.join(this.tasksDir, `${taskId}.json`);
      const data = await fs.readFile(filePath, 'utf8');

      return JSON.parse(data) as Task;
    } catch (error) {
      this.logger.error('Failed to get task', { taskId, error });
      throw new Error(`Task ${taskId} not found`);
    }
  }

  /**
   * 保存任务到文件系统
   * @param task 任务对象
   */
  private async saveTask(task: Task): Promise<void> {
    try {
      const filePath = path.join(this.tasksDir, `${task.id}.json`);

      await fs.writeFile(filePath, JSON.stringify(task, null, 2), 'utf8');
      this.logger.debug('Task saved', { taskId: task.id });
    } catch (error) {
      this.logger.error('Failed to save task', { task, error });
      throw error;
    }
  }

  /**
   * 根据过滤条件获取任务列表
   * @param filter 过滤条件
   * @returns 任务列表
   */
  public async getTasks(filter?: TaskFilter): Promise<Task[]> {
    try {
      // 读取所有任务文件
      const files = await fs.readdir(this.tasksDir);
      const taskFiles = files.filter(file => file.endsWith('.json'));

      // 读取所有任务
      const tasks: Task[] = [];

      for (const file of taskFiles) {
        const filePath = path.join(this.tasksDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const task = JSON.parse(data) as Task;

        tasks.push(task);
      }

      // 应用过滤条件
      if (filter) {
        return tasks.filter(task => {
          if (filter.type && task.type !== filter.type) {
            return false;
          }

          if (filter.status && task.status !== filter.status) {
            return false;
          }

          if (filter.itemId && task.itemId !== filter.itemId) {
            return false;
          }

          if (filter.itemType && task.itemType !== filter.itemType) {
            return false;
          }

          if (filter.created_after && new Date(task.created_at) < new Date(filter.created_after)) {
            return false;
          }

          if (
            filter.created_before &&
            new Date(task.created_at) > new Date(filter.created_before)
          ) {
            return false;
          }

          if (filter.updated_after && new Date(task.updated_at) < new Date(filter.updated_after)) {
            return false;
          }

          if (
            filter.updated_before &&
            new Date(task.updated_at) > new Date(filter.updated_before)
          ) {
            return false;
          }

          return true;
        });
      }

      return tasks;
    } catch (error) {
      this.logger.error('Failed to get tasks', { error });
      throw error;
    }
  }

  /**
   * 获取当前进行中的任务列表
   * @returns 进行中的任务列表
   */
  public getActiveTasksCount(): number {
    return this.activeTasksMap.size;
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   */
  public async deleteTask(taskId: string): Promise<void> {
    try {
      const filePath = path.join(this.tasksDir, `${taskId}.json`);

      await fs.unlink(filePath);

      // 从活动任务映射中移除
      this.activeTasksMap.delete(taskId);

      this.logger.info('Task deleted', { taskId });
    } catch (error) {
      this.logger.error('Failed to delete task', { taskId, error });
      throw error;
    }
  }
}
