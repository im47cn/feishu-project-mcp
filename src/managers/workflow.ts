import { WorkflowState, WorkflowStage, WorkflowTask, WorkflowFilter } from '../types/workflow.js';
import { RequirementAnalysisResult } from '../types/requirement.js';
import { ArchitectureDesignResult } from '../types/architecture.js';
import { CodeImplementationResult } from '../types/code.js';
import { TaskManager } from './task.js';
import { FeishuIntegrator } from '../integrators/feishu.js';
import { Logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus, TaskType } from '../types/task.js';

export interface WorkflowManagerConfig {
  storageDir: string;
  maxConcurrentWorkflows: number;
}

export class WorkflowManager {
  private taskManager: TaskManager;
  private feishuIntegrator: FeishuIntegrator;
  private logger: Logger;
  private config: WorkflowManagerConfig;
  private workflowsDir: string;

  constructor(
    taskManager: TaskManager,
    feishuIntegrator: FeishuIntegrator,
    config: WorkflowManagerConfig,
    logger: Logger
  ) {
    this.taskManager = taskManager;
    this.feishuIntegrator = feishuIntegrator;
    this.config = config;
    this.logger = logger;
    this.workflowsDir = path.join(config.storageDir, 'workflows');
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing WorkflowManager...');

      // 确保工作流存储目录存在
      await fs.mkdir(this.workflowsDir, { recursive: true });

      this.logger.info('WorkflowManager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WorkflowManager', { error });
      throw error;
    }
  }

  /**
   * 为需求创建并开始一个新的工作流
   * @param requirementId 需求ID
   * @returns 新工作流的ID
   */
  public async startWorkflow(requirementId: string): Promise<string> {
    this.logger.info('Starting workflow for requirement', { requirementId });

    // 创建一个新的工作流ID
    const workflowId = uuidv4();

    // 创建工作流状态对象
    const workflowState: WorkflowState = {
      id: workflowId,
      requirementId,
      currentStage: WorkflowStage.REQUIREMENT_ANALYSIS,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 保存工作流状态
    await this.saveWorkflowState(workflowState);

    // 创建第一个工作流任务：需求分析
    const task: WorkflowTask = {
      id: uuidv4(),
      type: TaskType.REQUIREMENT_ANALYSIS,
      status: TaskStatus.PENDING,
      itemId: requirementId,
      itemType: 'requirement',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workflowId,
      workflowStage: WorkflowStage.REQUIREMENT_ANALYSIS,
    };

    await this.taskManager.createTask(task);

    this.logger.info('Workflow started', { workflowId, requirementId, firstTaskId: task.id });

    return workflowId;
  }

  /**
   * 获取工作流当前状态
   * @param workflowId 工作流ID
   * @returns 工作流状态
   */
  public async getWorkflowState(workflowId: string): Promise<WorkflowState> {
    try {
      const filePath = path.join(this.workflowsDir, `${workflowId}.json`);
      const data = await fs.readFile(filePath, 'utf8');

      return JSON.parse(data) as WorkflowState;
    } catch (error) {
      this.logger.error('Failed to get workflow state', { workflowId, error });
      throw new Error(`Workflow ${workflowId} not found`);
    }
  }

  /**
   * 保存工作流状态
   * @param state 工作流状态
   */
  private async saveWorkflowState(state: WorkflowState): Promise<void> {
    try {
      const filePath = path.join(this.workflowsDir, `${state.id}.json`);

      await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
      this.logger.debug('Workflow state saved', { workflowId: state.id });
    } catch (error) {
      this.logger.error('Failed to save workflow state', { workflowId: state.id, error });
      throw error;
    }
  }

  /**
   * 更新工作流状态
   * @param workflowId 工作流ID
   * @param updates 更新的字段
   * @returns 更新后的工作流状态
   */
  public async updateWorkflowState(
    workflowId: string,
    updates: Partial<Omit<WorkflowState, 'id'>>
  ): Promise<WorkflowState> {
    // 获取当前状态
    const currentState = await this.getWorkflowState(workflowId);

    // 更新状态
    const newState: WorkflowState = {
      ...currentState,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // 保存更新后的状态
    await this.saveWorkflowState(newState);
    this.logger.info('Workflow state updated', { workflowId, updates });

    return newState;
  }

  /**
   * 将工作流推进到下一阶段
   * @param workflowId 工作流ID
   * @param result 当前阶段的结果
   * @returns 更新后的工作流状态
   */
  public async advanceWorkflow(
    workflowId: string,
    result?: RequirementAnalysisResult | ArchitectureDesignResult | CodeImplementationResult
  ): Promise<WorkflowState> {
    // 获取当前工作流状态
    const currentState = await this.getWorkflowState(workflowId);
    const currentStage = currentState.currentStage;

    // 确定下一阶段
    let nextStage: WorkflowStage;
    const updates: Partial<WorkflowState> = {};

    switch (currentStage) {
      case WorkflowStage.REQUIREMENT_ANALYSIS:
        if (result as RequirementAnalysisResult) {
          const analysisResult = result as RequirementAnalysisResult;

          updates.analysisResult = analysisResult;

          // 如果需求不完整，则进入需求澄清阶段
          if (!analysisResult.isComplete) {
            nextStage = WorkflowStage.REQUIREMENT_CLARIFICATION;

            // 更新飞书项目需求状态为"需求待完善"
            await this.feishuIntegrator.updateItemStatus(
              currentState.requirementId,
              'requirement_incomplete'
            );

            // 添加需求完善的评论
            await this.feishuIntegrator.addComment(
              currentState.requirementId,
              this.generateClarificationComment(analysisResult)
            );
          } else {
            // 需求完整，直接进入架构设计阶段
            nextStage = WorkflowStage.ARCHITECTURE_DESIGN;
          }
        } else {
          throw new Error(
            'Requirement analysis result is required to advance from REQUIREMENT_ANALYSIS stage'
          );
        }
        break;

      case WorkflowStage.REQUIREMENT_CLARIFICATION:
        // 进入架构设计阶段
        nextStage = WorkflowStage.ARCHITECTURE_DESIGN;
        break;

      case WorkflowStage.ARCHITECTURE_DESIGN:
        if (result as ArchitectureDesignResult) {
          updates.designResult = result as ArchitectureDesignResult;
        }
        // 进入代码实现阶段
        nextStage = WorkflowStage.CODE_IMPLEMENTATION;
        break;

      case WorkflowStage.CODE_IMPLEMENTATION:
        if (result as CodeImplementationResult) {
          updates.implementationResult = result as CodeImplementationResult;
        }
        // 进入代码提交阶段
        nextStage = WorkflowStage.CODE_SUBMISSION;
        break;

      case WorkflowStage.CODE_SUBMISSION:
        // 工作流完成
        nextStage = WorkflowStage.COMPLETION;
        updates.completedAt = new Date().toISOString();
        break;

      case WorkflowStage.COMPLETION:
        // 已经完成，不能再前进
        throw new Error('Workflow is already completed');

      default:
        throw new Error(`Unknown workflow stage: ${currentStage}`);
    }

    // 更新工作流状态
    updates.currentStage = nextStage;
    const updatedState = await this.updateWorkflowState(workflowId, updates);

    // 为下一阶段创建任务
    await this.createTaskForStage(workflowId, nextStage, currentState.requirementId);

    this.logger.info('Workflow advanced', {
      workflowId,
      fromStage: currentStage,
      toStage: nextStage,
    });

    return updatedState;
  }

  /**
   * 为工作流阶段创建相应的任务
   * @param workflowId 工作流ID
   * @param stage 工作流阶段
   * @param itemId 项目项ID
   */
  private async createTaskForStage(
    workflowId: string,
    stage: WorkflowStage,
    itemId: string
  ): Promise<void> {
    // 如果是完成阶段，不需要创建新任务
    if (stage === WorkflowStage.COMPLETION) {
      return;
    }

    // 根据阶段确定任务类型
    const taskType = this.getTaskTypeForStage(stage);

    const task: WorkflowTask = {
      id: uuidv4(),
      type: taskType,
      status: TaskStatus.PENDING,
      itemId,
      itemType: 'requirement',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workflowId,
      workflowStage: stage,
    };

    await this.taskManager.createTask(task);
  }

  /**
   * 根据工作流阶段获取对应的任务类型
   * @param stage 工作流阶段
   * @returns 任务类型
   */
  private getTaskTypeForStage(stage: WorkflowStage): TaskType {
    switch (stage) {
      case WorkflowStage.REQUIREMENT_ANALYSIS:
      case WorkflowStage.REQUIREMENT_CLARIFICATION:
      case WorkflowStage.ARCHITECTURE_DESIGN:
        return TaskType.REQUIREMENT_ANALYSIS;
      case WorkflowStage.CODE_IMPLEMENTATION:
      case WorkflowStage.CODE_SUBMISSION:
        return TaskType.CODE_IMPLEMENTATION;
      default:
        throw new Error(`Unknown workflow stage: ${stage}`);
    }
  }

  /**
   * 根据过滤条件获取工作流列表
   * @param filter 过滤条件
   * @returns 工作流状态列表
   */
  public async getWorkflows(filter?: WorkflowFilter): Promise<WorkflowState[]> {
    try {
      // 读取所有工作流文件
      const files = await fs.readdir(this.workflowsDir);
      const workflowFiles = files.filter(file => file.endsWith('.json'));

      // 读取所有工作流状态
      const workflows: WorkflowState[] = [];

      for (const file of workflowFiles) {
        const filePath = path.join(this.workflowsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const workflow = JSON.parse(data) as WorkflowState;

        workflows.push(workflow);
      }

      // 应用过滤条件
      if (filter) {
        return workflows.filter(workflow => {
          if (filter.requirementId && workflow.requirementId !== filter.requirementId) {
            return false;
          }

          if (filter.currentStage && workflow.currentStage !== filter.currentStage) {
            return false;
          }

          if (filter.startedAfter && new Date(workflow.startedAt) < new Date(filter.startedAfter)) {
            return false;
          }

          if (
            filter.startedBefore &&
            new Date(workflow.startedAt) > new Date(filter.startedBefore)
          ) {
            return false;
          }

          if (filter.updatedAfter && new Date(workflow.updatedAt) < new Date(filter.updatedAfter)) {
            return false;
          }

          if (
            filter.updatedBefore &&
            new Date(workflow.updatedAt) > new Date(filter.updatedBefore)
          ) {
            return false;
          }

          if (filter.completed !== undefined) {
            const isCompleted = !!workflow.completedAt;

            if (filter.completed !== isCompleted) {
              return false;
            }
          }

          return true;
        });
      }

      return workflows;
    } catch (error) {
      this.logger.error('Failed to get workflows', { error });
      throw error;
    }
  }

  /**
   * 为需求完整性分析结果生成澄清评论
   * @param result 需求分析结果
   * @returns 格式化的评论文本
   */
  private generateClarificationComment(result: RequirementAnalysisResult): string {
    let comment = `## 需求待完善通知\n\n`;

    comment += `您的需求文档需要补充一些信息才能继续开发。\n\n`;

    comment += `### 需求完整性评分\n`;
    comment += `当前完整性: ${result.completenessScore}/100\n\n`;

    if (result.missingAspects.length > 0) {
      comment += `### 缺失的需求方面\n`;
      result.missingAspects.forEach(aspect => {
        comment += `- ${aspect}\n`;
      });
      comment += `\n`;
    }

    if (result.clarificationQuestions.length > 0) {
      comment += `### 澄清问题\n`;
      result.clarificationQuestions.forEach((question, index) => {
        comment += `${index + 1}. ${question}\n`;
      });
      comment += `\n`;
    }

    comment += `请补充上述信息后通知开发团队继续处理。谢谢！\n`;

    return comment;
  }
}
