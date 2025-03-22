# 飞书项目MCP服务设计文档

## 1. 系统概述

飞书项目MCP服务是一个基于Model Context Protocol (MCP)的智能研发流程管理系统，旨在实现端到端的需求管理与开发流程自动化。该系统通过与飞书项目系统集成，提供需求分析、代码实现、任务管理等功能，帮助开发团队提高工作效率和质量。

## 2. 系统架构

### 2.1 整体架构

系统采用模块化设计，主要包括以下组件：

```
+----------------------------------+
|          飞书项目MCP服务           |
+----------------------------------+
|                                  |
|  +-------------+  +------------+ |
|  | 核心服务器    |  | 健康检查器  | |
|  +-------------+  +------------+ |
|                                  |
|  +-------------+  +------------+ |
|  | 飞书集成器    |  | 任务管理器  | |
|  +-------------+  +------------+ |
|                                  |
+----------------------------------+
         |              |
         v              v
+------------------+  +------------------+
|   飞书项目系统    |  |    文件系统      |
+------------------+  +------------------+
```

### 2.2 组件说明

#### 2.2.1 核心服务器

核心服务器基于Express实现，提供HTTP接口，包括健康检查接口和MCP工具接口。它负责接收和处理客户端请求，调用相应的组件完成任务，并返回结果。

#### 2.2.2 飞书集成器

飞书集成器负责与飞书项目系统进行交互，包括获取项目、需求和缺陷信息，更新项目状态，添加评论等。它使用飞书API进行通信，并处理认证、错误处理等逻辑。

#### 2.2.3 任务管理器

任务管理器负责管理系统内部任务，包括创建、查询、更新和删除任务。它将任务信息存储在文件系统中，并提供任务状态跟踪和管理功能。

#### 2.2.4 健康检查器

健康检查器负责监控系统各组件的健康状态，包括服务器状态、飞书集成状态、任务管理状态和内存使用情况。它提供健康检查接口，帮助运维人员监控系统状态。

## 3. 数据模型

### 3.1 任务模型

```typescript
enum TaskType {
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  BUG_ANALYSIS = 'bug_analysis',
  CODE_IMPLEMENTATION = 'code_implementation',
  CODE_REVIEW = 'code_review',
  DOCUMENTATION = 'documentation',
}

enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

interface Task {
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
```

### 3.2 飞书项目模型

```typescript
interface FeishuProject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner: FeishuUser;
  status: string;
}

interface FeishuRequirement {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
  assignee?: FeishuUser;
  project_id: string;
  attachments?: FeishuAttachment[];
  comments?: FeishuComment[];
  custom_fields?: Record<string, any>;
}

interface FeishuBug {
  id: string;
  title: string;
  description: string;
  priority: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
  assignee?: FeishuUser;
  project_id: string;
  attachments?: FeishuAttachment[];
  comments?: FeishuComment[];
  custom_fields?: Record<string, any>;
}
```

### 3.3 健康状态模型

```typescript
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  timestamp: string;
  uptime: number;
  components: ComponentHealth;
  integrations: IntegrationHealth;
  tasks: TaskHealth;
  memory: MemoryHealth;
}

interface ComponentHealth {
  server: ComponentStatus;
  taskManager: ComponentStatus;
  storage: ComponentStatus;
}

interface IntegrationHealth {
  feishu: ComponentStatus;
}

interface TaskHealth {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

interface MemoryHealth {
  heapUsed: number;
  heapTotal: number;
  external: number;
  systemTotal: number;
  systemFree: number;
  systemUsagePercent: number;
}

interface ComponentStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  message?: string;
}
```

## 4. 接口设计

### 4.1 HTTP接口

#### 4.1.1 健康检查接口

```
GET /health
```

返回系统健康状态信息，包括组件状态、集成状态、任务状态和内存使用情况。

#### 4.1.2 MCP工具接口

```
POST /mcp
```

请求体格式：

```json
{
  "tool": "工具名称",
  "params": {
    "参数1": "值1",
    "参数2": "值2"
  }
}
```

返回格式：

```json
{
  "success": true,
  "data": {
    // 工具返回的数据
  }
}
```

或者错误返回：

```json
{
  "success": false,
  "error": "错误信息"
}
```

### 4.2 MCP工具

#### 4.2.1 健康检查工具

- **health**: 获取完整的健康状态
- **health.components**: 获取组件健康状态
- **health.integrations**: 获取集成健康状态
- **health.tasks**: 获取任务健康状态
- **health.memory**: 获取内存使用情况

#### 4.2.2 飞书集成工具

- **feishu.projects**: 获取飞书项目列表
- **feishu.requirements**: 获取项目需求列表
- **feishu.bugs**: 获取项目缺陷列表

#### 4.2.3 任务管理工具

- **task.create**: 创建任务
- **task.get**: 获取任务详情

#### 4.2.4 模式工具

- **mode.analyze**: 分析需求或缺陷
- **mode.implement**: 实现需求或修复缺陷

## 5. 工作流程

### 5.1 需求分析流程

1. 客户端调用`feishu.projects`获取项目列表
2. 客户端选择项目，调用`feishu.requirements`获取需求列表
3. 客户端选择需求，调用`mode.analyze`分析需求
4. 系统创建需求分析任务，并返回任务ID
5. 客户端调用`task.get`获取任务状态和结果
6. 系统完成需求分析后，更新任务状态为完成，并返回分析结果

### 5.2 代码实现流程

1. 客户端调用`mode.implement`实现需求或修复缺陷
2. 系统创建代码实现任务，并返回任务ID
3. 客户端调用`task.get`获取任务状态和结果
4. 系统完成代码实现后，更新任务状态为完成，并返回实现结果

## 6. 部署架构

系统可以部署在单机环境或容器环境中，主要依赖包括：

- Node.js运行时
- 文件系统（用于存储任务数据）
- 网络连接（用于与飞书API通信）

推荐的部署方式是使用Docker容器，通过环境变量配置系统参数，如飞书API凭证、存储目录等。

## 7. 安全考虑

### 7.1 认证与授权

系统使用飞书API的认证机制，通过App ID和App Secret获取访问令牌，并使用令牌进行API调用。系统本身不提供额外的认证机制，依赖于部署环境的网络安全措施。

### 7.2 数据安全

系统将任务数据存储在文件系统中，不包含敏感信息。飞书API凭证通过环境变量配置，不会被持久化存储。

### 7.3 网络安全

系统与飞书API的通信使用HTTPS协议，确保数据传输的安全性。系统本身的HTTP接口可以通过反向代理配置HTTPS，或者限制为本地访问。

## 8. 扩展性考虑

系统设计考虑了以下扩展点：

- 添加新的MCP工具
- 集成其他项目管理系统
- 支持更多的任务类型
- 添加数据库存储替代文件系统
- 支持分布式部署

## 9. 监控与运维

系统提供健康检查接口，可以集成到监控系统中，监控系统状态。系统日志使用结构化格式，便于日志分析和问题排查。

## 10. 未来规划

- 支持更多飞书API功能
- 添加用户界面
- 支持多租户
- 添加更多AI功能
- 支持更多编程语言和框架
