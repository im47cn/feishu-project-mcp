export interface McpTool<T = Record<string, any>> {
  name: string;
  description: string;
  parameters: McpToolParameter[];
  execute: (params: T) => Promise<McpToolResponse>;
}

export interface McpToolParameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  default?: any;
}

export interface McpToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Update McpServer interface to handle generic tools
export interface McpServer {
  registerTool<T = Record<string, any>>(tool: McpTool<T>): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  getPort(): number;
  getHost(): string;
}

// Parameter type interfaces
export interface ProjectIdParam {
  projectId: string;
}

export interface TaskIdParam {
  taskId: string;
}

export interface CreateTaskParam {
  type: string;
  itemId: string;
  itemType: string;
}

export interface ItemParam {
  itemId: string;
  itemType: string;
}
