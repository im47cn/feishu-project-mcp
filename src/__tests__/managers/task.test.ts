import { TaskManager } from '../../managers/task';
import { Logger, LogLevel } from '../../utils/logger';
import { TaskStatus, TaskType } from '../../types/task';
import { FeishuItemType } from '../../types/feishu';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('../../utils/logger');

describe('TaskManager', () => {
  let taskManager: TaskManager;
  let logger: jest.Mocked<Logger>;
  let tempDir: string;
  let storageDir: string;

  beforeEach(() => {
    // Create temporary test directory
    tempDir = fs.mkdtempSync('task-manager-test-');
    storageDir = path.join(tempDir, 'tasks');

    // Mock logger
    logger = new Logger({
      level: LogLevel.INFO,
      directory: path.join(tempDir, 'logs'),
    }) as jest.Mocked<Logger>;

    // Create TaskManager instance
    taskManager = new TaskManager(
      {
        storageDir,
        maxConcurrentTasks: 5,
      },
      logger
    );
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );

      expect(task).toMatchObject({
        type: TaskType.REQUIREMENT_ANALYSIS,
        status: TaskStatus.CREATED,
        itemId: 'req1',
        itemType: FeishuItemType.REQUIREMENT,
      });

      // Verify task file was created
      const taskFile = path.join(storageDir, `${task.id}.json`);
      expect(fs.existsSync(taskFile)).toBe(true);

      const savedTask = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
      expect(savedTask).toEqual(task);
    });

    it('should enforce maximum concurrent tasks limit', async () => {
      const taskManager = new TaskManager(
        {
          storageDir,
          maxConcurrentTasks: 2,
        },
        logger
      );

      // Create two tasks (reaching the limit)
      await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );
      await taskManager.createTask(TaskType.BUG_ANALYSIS, 'bug1', FeishuItemType.BUG);

      // Attempt to create a third task
      await expect(
        taskManager.createTask(TaskType.REQUIREMENT_ANALYSIS, 'req2', FeishuItemType.REQUIREMENT)
      ).rejects.toThrow('Maximum concurrent tasks limit reached');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );

      const updatedTask = await taskManager.updateTaskStatus(task.id, TaskStatus.RUNNING);

      expect(updatedTask.status).toBe(TaskStatus.RUNNING);
      expect(updatedTask.updatedAt).not.toBe(task.updatedAt);

      // Verify file was updated
      const taskFile = path.join(storageDir, `${task.id}.json`);
      const savedTask = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
      expect(savedTask).toEqual(updatedTask);
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskManager.updateTaskStatus('non-existent', TaskStatus.RUNNING)
      ).rejects.toThrow('Task not found');
    });
  });

  describe('getTask', () => {
    it('should retrieve existing task', async () => {
      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );

      const retrievedTask = await taskManager.getTask(task.id);
      expect(retrievedTask).toEqual(task);
    });

    it('should return null for non-existent task', async () => {
      const task = await taskManager.getTask('non-existent');
      expect(task).toBeNull();
    });
  });

  describe('taskState management', () => {
    it('should save and load task state', async () => {
      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );

      const state = {
        analysisResult: 'Test result',
        completionStatus: 'pending',
      };

      await taskManager.saveTaskState(task.id, state);
      const loadedState = await taskManager.loadTaskState(task.id);

      expect(loadedState).toEqual(state);
    });

    it('should return null for non-existent task state', async () => {
      const state = await taskManager.loadTaskState('non-existent');
      expect(state).toBeNull();
    });
  });

  describe('task filtering', () => {
    beforeEach(async () => {
      // Create some test tasks
      await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );
      await taskManager.createTask(TaskType.BUG_ANALYSIS, 'bug1', FeishuItemType.BUG);

      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req2',
        FeishuItemType.REQUIREMENT
      );
      await taskManager.updateTaskStatus(task.id, TaskStatus.COMPLETED);
    });

    it('should filter tasks by status', async () => {
      const createdTasks = await taskManager.getTasksByStatus([TaskStatus.CREATED]);
      expect(createdTasks).toHaveLength(2);

      const completedTasks = await taskManager.getTasksByStatus([TaskStatus.COMPLETED]);
      expect(completedTasks).toHaveLength(1);
    });

    it('should filter tasks by complex criteria', async () => {
      const tasks = await taskManager.getTasksByFilter({
        status: [TaskStatus.CREATED],
        type: [TaskType.REQUIREMENT_ANALYSIS],
        itemType: [FeishuItemType.REQUIREMENT],
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].type).toBe(TaskType.REQUIREMENT_ANALYSIS);
      expect(tasks[0].itemType).toBe(FeishuItemType.REQUIREMENT);
    });
  });

  describe('cleanup', () => {
    it('should cleanup completed tasks', async () => {
      // Create and complete a task
      const task = await taskManager.createTask(
        TaskType.REQUIREMENT_ANALYSIS,
        'req1',
        FeishuItemType.REQUIREMENT
      );
      await taskManager.updateTaskStatus(task.id, TaskStatus.COMPLETED);

      // Create task state
      await taskManager.saveTaskState(task.id, { result: 'test' });

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Cleanup tasks
      await taskManager.cleanupCompletedTasks(new Date().toISOString());

      // Verify task and state files are removed
      const taskFile = path.join(storageDir, `${task.id}.json`);
      const stateFile = path.join(storageDir, `${task.id}.state.json`);

      expect(fs.existsSync(taskFile)).toBe(false);
      expect(fs.existsSync(stateFile)).toBe(false);
    });
  });
});
