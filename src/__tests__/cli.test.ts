import axios from 'axios';
import { Command } from 'commander';
import { WebSocket } from 'ws';
import * as cli from '../cli';

jest.mock('axios');
jest.mock('ws');
jest.mock('../index', () => ({}));

describe('CLI', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('status command', () => {
    const mockHealthyStatus = {
      status: 'healthy',
      version: '1.0.0',
      uptime: {
        seconds: 3600,
        formatted: '1h 0m 0s',
      },
      checks: {
        feishu: {
          status: 'up',
        },
        storage: {
          status: 'up',
          details: {
            path: './storage',
          },
        },
      },
    };

    it('should display healthy status', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockHealthyStatus });

      await cli.program.parseAsync(['node', 'test', 'status']);

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3000/health');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('🟢'));
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection refused');
      mockAxios.get.mockRejectedValueOnce(error);

      await cli.program.parseAsync(['node', 'test', 'status']);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error checking service status:',
        error.message
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('start command', () => {
    it('should start service with default configuration', async () => {
      await cli.program.parseAsync(['node', 'test', 'start']);

      // Service start is handled by requiring index.ts
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should start service with custom configuration', async () => {
      await cli.program.parseAsync([
        'node',
        'test',
        'start',
        '--token',
        'test-token',
        '--port',
        '3001',
      ]);

      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should handle startup errors', async () => {
      const error = new Error('Invalid configuration');
      jest.spyOn(require('../index'), 'default').mockImplementationOnce(() => {
        throw error;
      });

      await cli.program.parseAsync(['node', 'test', 'start']);

      expect(mockConsoleError).toHaveBeenCalledWith('Error starting service:', error.message);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('logs command', () => {
    const mockLogs = ['Log entry 1', 'Log entry 2'];

    it('should display logs', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockLogs });

      await cli.program.parseAsync(['node', 'test', 'logs']);

      expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/logs?lines=100'));
      expect(mockConsoleLog).toHaveBeenCalledWith(mockLogs);
    });

    it('should handle WebSocket connection for live logs', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockLogs });
      const mockWs = {
        on: jest.fn(),
        close: jest.fn(),
      };
      (WebSocket as jest.Mock).mockImplementationOnce(() => mockWs);

      await cli.program.parseAsync(['node', 'test', 'logs', '-f']);

      expect(WebSocket).toHaveBeenCalledWith('ws://localhost:3000/logs/stream');
      expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('tasks command', () => {
    const mockTasks = [
      {
        id: 'task1',
        type: 'requirement_analysis',
        status: 'running',
        createdAt: '2025-03-22T00:00:00Z',
      },
    ];

    it('should display running tasks', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockTasks });

      await cli.program.parseAsync(['node', 'test', 'tasks']);

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3000/tasks');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('task1'));
    });

    it('should display all tasks when --all flag is used', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockTasks });

      await cli.program.parseAsync(['node', 'test', 'tasks', '--all']);

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3000/tasks?all=true');
    });

    it('should handle task fetch errors', async () => {
      const error = new Error('Failed to fetch tasks');
      mockAxios.get.mockRejectedValueOnce(error);

      await cli.program.parseAsync(['node', 'test', 'tasks']);

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching tasks:', error.message);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
