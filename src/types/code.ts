/**
 * 代码实现相关的类型定义
 */

/**
 * 代码实现语言类型
 */
export enum CodeLanguage {
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  GO = 'go',
  CSHARP = 'csharp',
  CPP = 'cpp',
  PHP = 'php',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  OTHER = 'other',
}

/**
 * 代码质量指标
 */
export interface CodeQualityMetrics {
  /**
   * 代码行数
   */
  linesOfCode: number;

  /**
   * 代码复杂度
   */
  complexity: number;

  /**
   * 代码重复率
   */
  duplication: number;

  /**
   * 代码覆盖率
   */
  coverage?: number;

  /**
   * 代码问题数
   */
  issues: {
    errors: number;
    warnings: number;
    info: number;
  };

  /**
   * 代码可维护性指标
   */
  maintainability?: number;

  /**
   * 安全漏洞数
   */
  securityIssues?: number;
}

/**
 * 代码提交信息
 */
export interface CodeCommitInfo {
  /**
   * 仓库URL
   */
  repositoryUrl: string;

  /**
   * 分支名称
   */
  branch: string;

  /**
   * 提交ID
   */
  commitId?: string;

  /**
   * 提交消息
   */
  commitMessage: string;

  /**
   * 提交作者
   */
  author: string;

  /**
   * 提交时间
   */
  commitTime?: string;

  /**
   * PR/MR URL
   */
  pullRequestUrl?: string;

  /**
   * PR/MR 标题
   */
  pullRequestTitle?: string;
}

/**
 * 代码文件实现
 */
export interface CodeFileImplementation {
  /**
   * 文件路径
   */
  filePath: string;

  /**
   * 文件内容
   */
  content: string;

  /**
   * 代码语言
   */
  language: CodeLanguage;

  /**
   * 文件描述
   */
  description: string;

  /**
   * 是否是新文件
   */
  isNew: boolean;

  /**
   * 依赖的文件
   */
  dependencies?: string[];
}

/**
 * 测试用例实现
 */
export interface TestImplementation {
  /**
   * 测试文件路径
   */
  filePath: string;

  /**
   * 测试文件内容
   */
  content: string;

  /**
   * 测试种类 (单元测试、集成测试等)
   */
  type: string;

  /**
   * 测试描述
   */
  description: string;

  /**
   * 被测试的功能点
   */
  testedFeatures: string[];
}

/**
 * 代码实现结果
 */
export interface CodeImplementationResult {
  /**
   * 实现的代码文件
   */
  implementedFiles: CodeFileImplementation[];

  /**
   * 实现的测试文件
   */
  testFiles?: TestImplementation[];

  /**
   * 代码质量指标
   */
  qualityMetrics?: CodeQualityMetrics;

  /**
   * 代码提交信息
   */
  commitInfo?: CodeCommitInfo;

  /**
   * 实现时间戳
   */
  implementationTimestamp: string;
}
