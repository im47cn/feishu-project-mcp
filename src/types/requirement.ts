/**
 * 需求分析相关的类型定义
 */

/**
 * 需求完整性评估结果
 */
export interface RequirementAnalysisResult {
  /**
   * 需求是否完整
   */
  isComplete: boolean;

  /**
   * 需求完整性评分 (0-100)
   */
  completenessScore: number;

  /**
   * 缺失的需求方面清单
   */
  missingAspects: string[];

  /**
   * 澄清问题列表
   */
  clarificationQuestions: string[];

  /**
   * 详细分析报告
   */
  analysisReport: string;

  /**
   * 分析的时间戳
   */
  analysisTimestamp: string;
}

/**
 * 需求澄清反馈
 */
export interface RequirementClarificationFeedback {
  /**
   * 问题ID
   */
  questionId: string;

  /**
   * 澄清问题
   */
  question: string;

  /**
   * 问题回答
   */
  answer: string;

  /**
   * 回答时间戳
   */
  answeredAt: string;

  /**
   * 解决状态
   */
  resolved: boolean;
}

/**
 * 需求完整性检查项
 */
export enum RequirementCompleteness {
  FUNCTIONAL_DESCRIPTION = 'functional_description',
  ACCEPTANCE_CRITERIA = 'acceptance_criteria',
  EDGE_CASES = 'edge_cases',
  PERFORMANCE_METRICS = 'performance_metrics',
  SECURITY_CONSIDERATIONS = 'security_considerations',
  COMPATIBILITY_REQUIREMENTS = 'compatibility_requirements',
  USER_INTERFACE = 'user_interface',
  USER_EXPERIENCE = 'user_experience',
  INTEGRATION_POINTS = 'integration_points',
  DEPENDENCIES = 'dependencies',
}
