export enum TaskType {
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  BUG_ANALYSIS = 'bug_analysis',
  CODE_IMPLEMENTATION = 'code_implementation',
  CODE_REVIEW = 'code_review',
  DOCUMENTATION = 'documentation',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  itemId: string;
  itemType: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failed_at?: string;
  cancelled_at?: string;
  result?: any;
  error?: string;
}

export interface TaskManagerConfig {
  storageDir: string;
  maxConcurrentTasks: number;
}

export interface TaskFilter {
  type?: TaskType;
  status?: TaskStatus;
  itemId?: string;
  itemType?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}
