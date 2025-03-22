import { Logger, LogLevel } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

// Create mock types for winston
interface MockWinstonTransport {
  filename?: string;
  maxFiles?: number;
  maxsize?: string;
  level?: string;
}

interface MockWinstonLogger {
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  debug: jest.Mock;
}

// Mock winston module
jest.mock('winston', () => {
  const mockLogger: MockWinstonLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  const mockFileTransport = jest.fn().mockImplementation((config: MockWinstonTransport) => ({
    ...config,
    _type: 'file',
  }));

  const mockConsoleTransport = jest.fn().mockImplementation(() => ({
    _type: 'console',
  }));

  return {
    createLogger: jest.fn().mockReturnValue(mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn(),
    },
    transports: {
      File: mockFileTransport,
      Console: mockConsoleTransport,
    },
  };
});

describe('Logger', () => {
  let logger: Logger;
  let tempDir: string;
  let logDir: string;
  let mockWinstonLogger: MockWinstonLogger;

  beforeEach(() => {
    // Create temporary test directory
    tempDir = fs.mkdtempSync('logger-test-');
    logDir = path.join(tempDir, 'logs');

    // Create logger instance
    logger = new Logger({
      level: LogLevel.INFO,
      directory: logDir,
    });

    // Get mock winston logger instance
    mockWinstonLogger = (winston.createLogger as jest.Mock).mock.results[0].value;
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create log directory if it does not exist', () => {
      expect(fs.existsSync(logDir)).toBe(true);
    });

    it('should initialize with correct configuration', () => {
      expect(winston.createLogger).toHaveBeenCalled();
      const fileTransportCalls = (winston.transports.File as unknown as jest.Mock).mock.calls;
      expect(fileTransportCalls.length).toBe(2); // Error and combined logs
    });

    it('should add console transport in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      new Logger({ level: LogLevel.INFO, directory: logDir });
      expect(winston.transports.Console).toHaveBeenCalled();
    });
  });

  describe('logging methods', () => {
    const testMessage = 'Test message';
    const testMeta = { key: 'value' };

    it('should log error messages', () => {
      logger.error(testMessage, testMeta);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(testMessage, testMeta);
    });

    it('should log warning messages', () => {
      logger.warn(testMessage, testMeta);
      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(testMessage, testMeta);
    });

    it('should log info messages', () => {
      logger.info(testMessage, testMeta);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(testMessage, testMeta);
    });

    it('should log debug messages', () => {
      logger.debug(testMessage, testMeta);
      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(testMessage, testMeta);
    });
  });

  describe('metric logging', () => {
    it('should log metrics in correct format', () => {
      const metricName = 'test_metric';
      const metricValue = 42;
      const metricUnit = 'count';

      logger.metric(metricName, metricValue, metricUnit);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith('metric', {
        metric: metricName,
        value: metricValue,
        unit: metricUnit,
        timestamp: expect.any(String),
      });
    });
  });

  describe('log file management', () => {
    it('should return correct log file path', () => {
      const expectedDate = new Date().toISOString().split('T')[0];
      const expectedPath = path.join(logDir, `combined-${expectedDate}.log`);
      expect(logger.getCurrentLogFilePath()).toBe(expectedPath);
    });

    it('should use correct file names for different log levels', () => {
      new Logger({ level: LogLevel.DEBUG, directory: logDir });

      const fileTransportCalls = (winston.transports.File as unknown as jest.Mock).mock.calls;
      const fileConfigs = fileTransportCalls.map(call => call[0] as MockWinstonTransport);

      expect(fileConfigs.some(config => config.filename?.includes('error-'))).toBe(true);
      expect(fileConfigs.some(config => config.filename?.includes('combined-'))).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', () => {
      // Simulate file system error
      jest.spyOn(fs, 'mkdirSync').mockImplementationOnce(() => {
        throw new Error('File system error');
      });

      expect(() => {
        new Logger({ level: LogLevel.INFO, directory: '/invalid/path' });
      }).toThrow('File system error');
    });
  });

  describe('configuration validation', () => {
    it('should use default values for optional config', () => {
      const logger = new Logger({ level: LogLevel.INFO, directory: logDir });
      const fileTransportCalls = (winston.transports.File as unknown as jest.Mock).mock.calls;
      const fileConfigs = fileTransportCalls.map(call => call[0] as MockWinstonTransport);

      fileConfigs.forEach(config => {
        expect(config.maxFiles).toBe(7);
        expect(config.maxsize).toBe('10m');
      });
    });

    it('should override default values with provided config', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        directory: logDir,
        maxFiles: 3,
        maxSize: '5m',
      });

      const fileTransportCalls = (winston.transports.File as unknown as jest.Mock).mock.calls;
      const fileConfigs = fileTransportCalls.map(call => call[0] as MockWinstonTransport);

      fileConfigs.forEach(config => {
        expect(config.maxFiles).toBe(3);
        expect(config.maxsize).toBe('5m');
      });
    });
  });
});
