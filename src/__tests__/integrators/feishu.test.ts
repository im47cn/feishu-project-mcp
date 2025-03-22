import axios from 'axios';
import { FeishuIntegrator, FeishuIntegratorConfig } from '../../integrators/feishu';
import { Logger, LogLevel } from '../../utils/logger';
import { FeishuItemType } from '../../types/feishu';

jest.mock('axios');
jest.mock('../../utils/logger');

describe('FeishuIntegrator', () => {
  let integrator: FeishuIntegrator;
  let config: FeishuIntegratorConfig;
  let logger: jest.Mocked<Logger>;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    // Mock configuration
    config = {
      apiToken: 'test-token',
      apiUrl: 'https://test-api.feishu.cn',
      requestTimeout: 5000,
    };

    // Mock logger
    logger = new Logger({
      level: LogLevel.INFO,
      directory: './logs',
    }) as jest.Mocked<Logger>;

    // Mock axios
    mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.create.mockReturnValue(mockedAxios as any);

    // Create integrator instance
    integrator = new FeishuIntegrator(config, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = {
        code: 0,
        data: [
          {
            id: 'project1',
            name: 'Test Project',
            createdAt: '2025-03-22T00:00:00Z',
            updatedAt: '2025-03-22T00:00:00Z',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await integrator.getProjects();

      expect(result).toEqual(mockProjects.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/projects');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(integrator.getProjects()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get projects', { error });
    });
  });

  describe('getRequirements', () => {
    const projectId = 'project1';
    const filter = { status: ['open'], assignee: 'user1' };

    it('should fetch requirements successfully', async () => {
      const mockRequirements = {
        code: 0,
        data: [
          {
            id: 'req1',
            title: 'Test Requirement',
            type: FeishuItemType.REQUIREMENT,
            status: 'open',
            creator: 'user1',
            projectId: 'project1',
            createdAt: '2025-03-22T00:00:00Z',
            updatedAt: '2025-03-22T00:00:00Z',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockRequirements });

      const result = await integrator.getRequirements(projectId, filter);

      expect(result).toEqual(mockRequirements.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/requirements', {
        params: {
          project_id: projectId,
          ...filter,
        },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(integrator.getRequirements(projectId)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get requirements', {
        error,
        projectId,
      });
    });
  });

  describe('getBugs', () => {
    const projectId = 'project1';
    const filter = { status: ['open'], severity: ['high'] };

    it('should fetch bugs successfully', async () => {
      const mockBugs = {
        code: 0,
        data: [
          {
            id: 'bug1',
            title: 'Test Bug',
            type: FeishuItemType.BUG,
            severity: 'high',
            status: 'open',
            creator: 'user1',
            projectId: 'project1',
            createdAt: '2025-03-22T00:00:00Z',
            updatedAt: '2025-03-22T00:00:00Z',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockBugs });

      const result = await integrator.getBugs(projectId, filter);

      expect(result).toEqual(mockBugs.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/bugs', {
        params: {
          project_id: projectId,
          ...filter,
        },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(integrator.getBugs(projectId)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get bugs', {
        error,
        projectId,
      });
    });
  });

  describe('updateItemStatus', () => {
    const itemId = 'item1';
    const status = 'in_progress';

    it('should update item status successfully', async () => {
      const mockResponse = {
        code: 0,
        data: { success: true },
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: mockResponse });

      await integrator.updateItemStatus(itemId, status);

      expect(mockedAxios.patch).toHaveBeenCalledWith(`/item/${itemId}`, {
        status,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(integrator.updateItemStatus(itemId, status)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to update item status', {
        error,
        itemId,
        status,
      });
    });
  });

  describe('addComment', () => {
    const itemId = 'item1';
    const content = 'Test comment';

    it('should add comment successfully', async () => {
      const mockComment = {
        code: 0,
        data: {
          id: 'comment1',
          content,
          creator: 'user1',
          itemId,
          createdAt: '2025-03-22T00:00:00Z',
          updatedAt: '2025-03-22T00:00:00Z',
        },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockComment });

      const result = await integrator.addComment(itemId, content);

      expect(result).toEqual(mockComment.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(`/item/${itemId}/comments`, {
        content,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(integrator.addComment(itemId, content)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to add comment', {
        error,
        itemId,
      });
    });
  });
});
