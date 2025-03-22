import { Logger } from '../utils/logger.js';
import { Task, TaskType, TaskStatus, TaskManagerConfig, TaskFilter } from '../types/task.js';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class TaskManager {
  private config: TaskManagerConfig;
  private logger: Logger;
  private tasksDir: string;

  constructor(config: TaskManagerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.tasksDir = path.join(config.storageDir, 'tasks');
  }

  public async createStorageDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.config.storageDir, { recursive: true });
      await fs.mkdir(this.tasksDir, { recursive: true });
      this.logger.info('Storage directories created successfully');
    } catch (error) {
      this.logger.error('Failed to create storage directories', { error });
      throw error;
    }
  }

  public getStorageDir(): string {
    return this.config.storageDir;
  }

  public async createTask(type: TaskType, itemId: string, itemType: string): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      type,
      status: TaskStatus.PENDING,
      itemId,
      itemType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await this.saveTask(task);
      this.logger.info('Task created', { taskId: task.id, type, itemId });

      return task;
    } catch (error) {
      this.logger.error('Failed to create task', { error, type, itemId });
      throw error;
    }
  }

  public async getTask(taskId: string): Promise<Task | null> {
    try {
      const filePath = this.getTaskFilePath(taskId);
      const content = await fs.readFile(filePath, 'utf8');

      return JSON.parse(content) as Task;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      this.logger.error('Failed to get task', { error, taskId });
      throw error;
    }
  }

  public async getTasks(filter?: TaskFilter): Promise<Task[]> {
    try {
      const files = await fs.readdir(this.tasksDir);
      const tasks: Task[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue;
        }

        try {
          const content = await fs.readFile(path.join(this.tasksDir, file), 'utf8');
          const task = JSON.parse(content) as Task;

          if (this.matchesFilter(task, filter)) {
            tasks.push(task);
          }
        } catch (error) {
          this.logger.warn('Failed to read task file', { error, file });
        }
      }

      return tasks;
    } catch (error) {
      this.logger.error('Failed to get tasks', { error });
      throw error;
    }
  }

  public async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTask(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updatedTask: Task = {
      ...task,
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === TaskStatus.COMPLETED) {
      updatedTask.completed_at = new Date().toISOString();
    }

    try {
      await this.saveTask(updatedTask);
      this.logger.info('Task status updated', { taskId, status });

      return updatedTask;
    } catch (error) {
      this.logger.error('Failed to update task status', { error, taskId });
      throw error;
    }
  }

  public async deleteTask(taskId: string): Promise<void> {
    try {
      const filePath = this.getTaskFilePath(taskId);

      await fs.unlink(filePath);
      this.logger.info('Task deleted', { taskId });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error('Failed to delete task', { error, taskId });
        throw error;
      }
    }
  }

  public async canCreateNewTask(): Promise<boolean> {
    const tasks = await this.getTasks({ status: TaskStatus.IN_PROGRESS });

    return tasks.length < this.config.maxConcurrentTasks;
  }

  private async saveTask(task: Task): Promise<void> {
    const filePath = this.getTaskFilePath(task.id);

    await fs.writeFile(filePath, JSON.stringify(task, null, 2));
  }

  private getTaskFilePath(taskId: string): string {
    return path.join(this.tasksDir, `${taskId}.json`);
  }

  private matchesFilter(task: Task, filter?: TaskFilter): boolean {
    if (!filter) {
      return true;
    }

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
    if (filter.created_before && new Date(task.created_at) > new Date(filter.created_before)) {
      return false;
    }
    if (filter.updated_after && new Date(task.updated_at) < new Date(filter.updated_after)) {
      return false;
    }
    if (filter.updated_before && new Date(task.updated_at) > new Date(filter.updated_before)) {
      return false;
    }

    return true;
  }
}
