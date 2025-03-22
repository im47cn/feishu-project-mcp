/**
 * 任务管理相关的类型定义
 */
import { WorkflowStage } from './workflow.js';

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * 任务类型枚举
 */
export enum TaskType {
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  ARCHITECTURE_DESIGN = 'architecture_design',
  CODE_IMPLEMENTATION = 'code_implementation',
  CODE_SUBMISSION = 'code_submission',
}

/**
 * 任务对象
 */
export interface Task {
  /**
   * 任务ID
   */
  id: string;

  /**
   * 任务类型
   */
  type: TaskType;

  /**
   * 任务状态
   */
  status: TaskStatus;

  /**
   * 任务描述
   */
  description?: string;

  /**
   * 关联项目ID (如需求ID)
   */
  itemId: string;

  /**
   * 关联项目类型 (如"requirement")
   */
  itemType: string;

  /**
   * 关联工作流ID
   */
  workflowId?: string;

  /**
   * 关联工作流阶段
   */
  workflowStage?: WorkflowStage;

  /**
   * 任务创建时间
   */
  created_at: string;

  /**
   * 任务更新时间
   */
  updated_at: string;

  /**
   * 任务开始时间
   */
  started_at?: string;

  /**
   * 任务完成时间
   */
  completed_at?: string;

  /**
   * 任务失败时间
   */
  failed_at?: string;

  /**
   * 任务取消时间
   */
  cancelled_at?: string;

  /**
   * 任务结果
   */
  result?: any;

  /**
   * 任务错误信息
   */
  error?: string;

  /**
   * 任务进度 (0-100)
   */
  progress?: number;

  /**
   * 优先级
   */
  priority?: number;

  /**
   * 分配给
   */
  assignedTo?: string;

  /**
   * 任务元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 任务过滤条件
 */
export interface TaskFilter {
  /**
   * 任务类型
   */
  type?: TaskType;

  /**
   * 任务状态
   */
  status?: TaskStatus;

  /**
   * 关联项目ID
   */
  itemId?: string;

  /**
   * 关联项目类型
   */
  itemType?: string;

  /**
   * 关联工作流ID
   */
  workflowId?: string;

  /**
   * 在此日期之后创建
   */
  created_after?: string;

  /**
   * 在此日期之前创建
   */
  created_before?: string;

  /**
   * 在此日期之后更新
   */
  updated_after?: string;

  /**
   * 在此日期之前更新
   */
  updated_before?: string;

  /**
   * 分配给
   */
  assignedTo?: string;
}

/**
 * 任务管理器配置
 */
export interface TaskManagerConfig {
  /**
   * 存储目录
   */
  storageDir: string;

  /**
   * 最大并发任务数
   */
  maxConcurrentTasks?: number;
}
