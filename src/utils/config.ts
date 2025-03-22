import { ServerConfig } from '../core/server.js';
import dotenv from 'dotenv';
import path from 'path';

export function parseConfig(args: string[]): ServerConfig {
  // Load environment variables
  const nodeEnv = process.env.NODE_ENV || 'development';

  dotenv.config({ path: `.env.${nodeEnv}` });

  // Parse command line arguments into a map
  const argMap = new Map<string, string>();

  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      argMap.set(args[i].slice(2), args[i + 1]);
    }
  }

  // Get values with fallbacks
  const getValue = (argKey: string, envKey: string, defaultValue: string): string => {
    return argMap.get(argKey) || process.env[envKey] || defaultValue;
  };

  // Parse configuration
  const config: ServerConfig = {
    name: getValue('name', 'SERVICE_NAME', 'feishu-project-mcp'),
    version: getValue('version', 'SERVICE_VERSION', '1.0.0'),
    host: getValue('host', 'HOST', 'localhost'),
    port: parseInt(getValue('port', 'PORT', '3000'), 10),
    feishu: {
      appId: getValue('feishu-app-id', 'FEISHU_APP_ID', ''),
      appSecret: getValue('feishu-app-secret', 'FEISHU_APP_SECRET', ''),
      apiUrl: getValue('feishu-api-url', 'FEISHU_API_URL', 'https://open.feishu.cn/open-apis'),
    },
    storage: {
      dir: getValue('storage-dir', 'STORAGE_DIR', './storage'),
      maxConcurrentTasks: parseInt(
        getValue('max-concurrent-tasks', 'MAX_CONCURRENT_TASKS', '5'),
        10
      ),
    },
  };

  // Validate required configuration
  validateConfig(config);

  return config;
}

function validateConfig(config: ServerConfig): void {
  const errors: string[] = [];

  if (!config.feishu.appId) {
    errors.push('Feishu App ID is required');
  }

  if (!config.feishu.appSecret) {
    errors.push('Feishu App Secret is required');
  }

  if (!config.feishu.apiUrl) {
    errors.push('Feishu API URL is required');
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }

  if (config.storage.maxConcurrentTasks < 1) {
    errors.push('Maximum concurrent tasks must be at least 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  // Convert storage directory to absolute path
  config.storage.dir = path.resolve(config.storage.dir);
}
