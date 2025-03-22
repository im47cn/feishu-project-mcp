/**
 * 架构设计相关的类型定义
 */

/**
 * 系统影响范围
 */
export enum SystemImpactScope {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  API = 'api',
  INFRASTRUCTURE = 'infrastructure',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
}

/**
 * 架构决策记录类型
 */
export interface ArchitectureDecisionRecord {
  /**
   * 决策ID
   */
  id: string;

  /**
   * 决策标题
   */
  title: string;

  /**
   * 决策背景
   */
  context: string;

  /**
   * 考虑的选项
   */
  options: {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
  }[];

  /**
   * 选择的方案
   */
  decision: string;

  /**
   * 决策理由
   */
  rationale: string;

  /**
   * 决策后果
   */
  consequences: string[];

  /**
   * 相关决策
   */
  relatedDecisions?: string[];
}

/**
 * 系统影响分析
 */
export interface SystemImpactAnalysis {
  /**
   * 影响范围
   */
  impactScopes: SystemImpactScope[];

  /**
   * 受影响的组件
   */
  affectedComponents: string[];

  /**
   * 受影响的服务
   */
  affectedServices: string[];

  /**
   * 受影响的API
   */
  affectedApis: string[];

  /**
   * 受影响的数据模型
   */
  affectedDataModels: string[];

  /**
   * 潜在风险
   */
  potentialRisks: string[];

  /**
   * 风险缓解措施
   */
  mitigationStrategies: string[];
}

/**
 * 架构设计结果
 */
export interface ArchitectureDesignResult {
  /**
   * 系统影响分析
   */
  impactAnalysis: SystemImpactAnalysis;

  /**
   * 架构决策记录
   */
  decisionRecords: ArchitectureDecisionRecord[];

  /**
   * 技术方案概述
   */
  technicalSolutionOverview: string;

  /**
   * 组件详细设计
   */
  componentDesigns: {
    name: string;
    purpose: string;
    responsibilities: string[];
    interfaces: string[];
    dependencies: string[];
    implementation: string;
  }[];

  /**
   * API设计
   */
  apiDesigns?: {
    endpoint: string;
    method: string;
    parameters: { name: string; type: string; description: string }[];
    responses: { code: number; description: string; schema: string }[];
  }[];

  /**
   * 数据模型设计
   */
  dataModelDesigns?: {
    name: string;
    fields: { name: string; type: string; description: string }[];
    relationships: { relatedModel: string; type: string; description: string }[];
  }[];

  /**
   * 设计时间戳
   */
  designTimestamp: string;
}
