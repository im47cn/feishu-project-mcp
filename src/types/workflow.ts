/**
 * 工作流相关的类型定义
 */
import { RequirementAnalysisResult } from './requirement.js';
import { ArchitectureDesignResult } from './architecture.js';
import { CodeImplementationResult } from './code.js';
import { Task, TaskType, TaskStatus } from './task.js';

/**
 * 工作流阶段枚举
 */
export enum WorkflowStage {
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  REQUIREMENT_CLARIFICATION = 'requirement_clarification',
  ARCHITECTURE_DESIGN = 'architecture_design',
  CODE_IMPLEMENTATION = 'code_implementation',
  CODE_SUBMISSION = 'code_submission',
  COMPLETION = 'completion',
}

/**
 * 工作流状态接口
 */
export interface WorkflowState {
  /**
   * 工作流ID
   */
  id: string;

  /**
   * 需求ID
   */
  requirementId: string;

  /**
   * 当前工作流阶段
   */
  currentStage: WorkflowStage;

  /**
   * 工作流开始时间
   */
  startedAt: string;

  /**
   * 工作流更新时间
   */
  updatedAt: string;

  /**
   * 工作流完成时间
   */
  completedAt?: string;

  /**
   * 需求分析结果
   */
  analysisResult?: RequirementAnalysisResult;

  /**
   * 架构设计结果
   */
  designResult?: ArchitectureDesignResult;

  /**
   * 代码实现结果
   */
  implementationResult?: CodeImplementationResult;

  /**
   * 工作流元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 工作流任务接口
 * 工作流任务是一种特殊的任务，它包含额外的工作流相关信息
 */
export interface WorkflowTask extends Task {
  /**
   * 工作流ID (覆盖Task中的可选属性，使其必需)
   */
  workflowId: string;

  /**
   * 工作流阶段 (覆盖Task中的可选属性，使其必需且类型为WorkflowStage)
   */
  workflowStage: WorkflowStage;
}

/**
 * 工作流过滤条件
 */
export interface WorkflowFilter {
  /**
   * 需求ID
   */
  requirementId?: string;

  /**
   * 当前阶段
   */
  currentStage?: WorkflowStage;

  /**
   * 在此日期之后开始
   */
  startedAfter?: string;

  /**
   * 在此日期之前开始
   */
  startedBefore?: string;

  /**
   * 在此日期之后更新
   */
  updatedAfter?: string;

  /**
   * 在此日期之前更新
   */
  updatedBefore?: string;

  /**
   * 是否已完成
   */
  completed?: boolean;
}
