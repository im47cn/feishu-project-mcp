import { parseConfig } from '../../utils/config';
import { LogLevel } from '../../utils/logger';

describe('Configuration Parser', () => {
  const defaultConfig = {
    name: 'feishu-project-mcp',
    version: '1.0.0',
    checkInterval: 15 * 60 * 1000,
    feishuToken: '',
    storageDir: './storage',
    logDir: './logs',
    logLevel: LogLevel.INFO,
    maxConcurrentTasks: 10,
  };

  it('should return default configuration when no arguments provided', () => {
    const config = parseConfig([]);
    expect(config).toEqual(defaultConfig);
  });

  it('should throw error when feishu token is not provided', () => {
    expect(() => parseConfig([])).toThrow('Feishu token is required');
  });

  it('should parse feishu token correctly', () => {
    const token = 'test-token';
    const config = parseConfig(['--feishu-token', token]);
    expect(config.feishuToken).toBe(token);
  });

  it('should parse feishu API URL correctly', () => {
    const url = 'https://custom-feishu-api.com';
    const config = parseConfig(['--feishu-token', 'test-token', '--feishu-api-url', url]);
    expect(config.feishuApiUrl).toBe(url);
  });

  it('should parse check interval correctly', () => {
    const interval = '300000'; // 5 minutes
    const config = parseConfig(['--feishu-token', 'test-token', '--check-interval', interval]);
    expect(config.checkInterval).toBe(parseInt(interval, 10));
  });

  it('should throw error for invalid check interval', () => {
    expect(() => parseConfig(['--feishu-token', 'test-token', '--check-interval', '1000'])).toThrow(
      'Check interval must be at least 60 seconds'
    );
  });

  it('should parse storage directory correctly', () => {
    const dir = './custom-storage';
    const config = parseConfig(['--feishu-token', 'test-token', '--storage-dir', dir]);
    expect(config.storageDir).toBe(dir);
  });

  it('should parse log directory correctly', () => {
    const dir = './custom-logs';
    const config = parseConfig(['--feishu-token', 'test-token', '--log-dir', dir]);
    expect(config.logDir).toBe(dir);
  });

  it('should parse log level correctly', () => {
    const level = 'debug';
    const config = parseConfig(['--feishu-token', 'test-token', '--log-level', level]);
    expect(config.logLevel).toBe(level);
  });

  it('should throw error for invalid log level', () => {
    expect(() => parseConfig(['--feishu-token', 'test-token', '--log-level', 'invalid'])).toThrow(
      'Log level must be one of:'
    );
  });

  it('should parse max concurrent tasks correctly', () => {
    const maxTasks = '5';
    const config = parseConfig([
      '--feishu-token',
      'test-token',
      '--max-concurrent-tasks',
      maxTasks,
    ]);
    expect(config.maxConcurrentTasks).toBe(parseInt(maxTasks, 10));
  });

  it('should throw error for invalid max concurrent tasks', () => {
    expect(() =>
      parseConfig(['--feishu-token', 'test-token', '--max-concurrent-tasks', '0'])
    ).toThrow('Maximum concurrent tasks must be at least 1');
  });

  it('should parse multiple arguments correctly', () => {
    const args = [
      '--feishu-token',
      'test-token',
      '--feishu-api-url',
      'https://custom-api.com',
      '--check-interval',
      '300000',
      '--storage-dir',
      './custom-storage',
      '--log-dir',
      './custom-logs',
      '--log-level',
      'debug',
      '--max-concurrent-tasks',
      '5',
    ];

    const config = parseConfig(args);
    expect(config).toEqual({
      ...defaultConfig,
      feishuToken: 'test-token',
      feishuApiUrl: 'https://custom-api.com',
      checkInterval: 300000,
      storageDir: './custom-storage',
      logDir: './custom-logs',
      logLevel: 'debug',
      maxConcurrentTasks: 5,
    });
  });

  it('should ignore unknown arguments', () => {
    const config = parseConfig(['--feishu-token', 'test-token', '--unknown-arg', 'value']);
    expect(config.feishuToken).toBe('test-token');
    expect((config as any)['unknown-arg']).toBeUndefined();
  });
});
