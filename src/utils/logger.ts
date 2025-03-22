import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

export interface LoggerConfig {
  level: string;
  logDir: string;
  serviceName: string;
}

export class Logger {
  private logger: winston.Logger;

  constructor(config: LoggerConfig) {
    const logDir = path.resolve(config.logDir);

    // Create console format
    const consoleFormat = combine(
      colorize(),
      timestamp(),
      printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';

        return `${timestamp} [${config.serviceName}] ${level}: ${message} ${metaStr}`;
      })
    );

    // Create file format
    const fileFormat = combine(timestamp(), json());

    // Create logger instance
    this.logger = winston.createLogger({
      level: config.level,
      defaultMeta: { service: config.serviceName },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // Combined log file
        new winston.transports.File({
          filename: path.join(logDir, `combined-${this.getDate()}.log`),
          format: fileFormat,
        }),
        // Error log file
        new winston.transports.File({
          filename: path.join(logDir, `error-${this.getDate()}.log`),
          level: 'error',
          format: fileFormat,
        }),
      ],
    });

    this.info(`Logger initialized with level: ${config.level}`);
  }

  private getDate(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}
