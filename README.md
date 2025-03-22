# 飞书项目MCP服务

基于Model Context Protocol (MCP)的智能研发流程管理系统，实现端到端的需求管理与开发流程自动化。

## 功能特点

- **需求读取与完整性分析**：从飞书项目系统中提取需求文档，进行深度分析并评估需求完整性
- **需求完善反馈循环**：对不完整需求，生成精准的澄清问题清单，并更新需求状态
- **架构设计与技术方案**：基于完整需求，生成全面技术方案，包括项目影响分析与架构决策
- **代码实现与质量控制**：转入代码实现模式，依据技术方案高质量实现功能
- **自动化代码提交**：调用 Gitlab MCP，实现代码自动提交与版本控制
- **任务状态更新与通知**：完成后自动更新飞书项目状态并添加PR评论

## 系统架构

系统采用模块化设计，主要包括以下组件：

- **核心服务器**：基于Express实现的HTTP服务器，提供健康检查和MCP工具接口
- **飞书集成器**：负责与飞书API交互，获取项目、需求和缺陷信息
- **任务管理器**：负责管理系统内部任务，包括创建、查询、更新和删除
- **健康检查器**：负责监控系统各组件的健康状态

详细的架构设计请参考[设计文档](docs/design.md)。

## 快速开始

### 前置条件

- Node.js 18+
- 飞书项目系统账号和API凭证

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/feishu-project-mcp.git
cd feishu-project-mcp

# 安装依赖
npm install
```

### 配置

创建`.env`文件，配置以下环境变量：

```
# Feishu API Configuration
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_API_URL=https://project.feishu.cn/open_api

# Service Configuration
CHECK_INTERVAL=5000
STORAGE_DIR=./storage
LOG_DIR=./logs
LOG_LEVEL=info
MAX_CONCURRENT_TASKS=5

# Server Configuration
PORT=3000
HOST=localhost
```

### 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### 使用npx调用

本项目支持通过npx调用，但目前尚未发布到npm注册表。在发布之前，你可以通过以下方式使用npx调用：

#### 从本地项目调用

在项目目录中运行：

```bash
# 先构建项目
npm run build

# 使用npx调用本地包
npx . [参数]
```

或者使用完整路径：

```bash
npx /path/to/feishu-project-mcp [参数]
```

#### 传递参数

你可以向npx命令传递参数：

```bash
npx . --port 3001 --host 0.0.0.0
```

#### 发布后使用

当项目发布到npm注册表后，你可以直接使用：

```bash
npx feishu-project-mcp [参数]
```

并且可以指定版本：

```bash
npx feishu-project-mcp@1.0.0 [参数]
```

### 使用Docker

```bash
# 构建镜像
docker build -t feishu-project-mcp .

# 运行容器
docker run -p 3000:3000 --env-file .env feishu-project-mcp
```

## 在Cline中配置MCP服务

要在Cline的MCP设置文件中配置飞书项目MCP服务，请按照以下步骤操作：

1. 打开MCP设置文件：`cline_mcp_settings.json`
2. 在`mcpServers`对象中添加一个新条目，如下所示：

```json
"feishu-project-mcp": {
  "command": "node",
  "args": [
    "/path/to/feishu-project-mcp/dist/index.js"
  ],
  "env": {
    "FEISHU_APP_ID": "your_app_id",
    "FEISHU_APP_SECRET": "your_app_secret",
    "FEISHU_API_URL": "https://project.feishu.cn/open_api"
  },
  "disabled": false,
  "alwaysAllow": [
    "health",
    "health.components",
    "health.integrations",
    "health.tasks",
    "health.memory",
    "feishu.projects",
    "feishu.requirements",
    "feishu.bugs",
    "task.create",
    "task.get",
    "mode.analyze",
    "mode.implement"
  ]
}
```

3. 保存文件并重启Cline

### 使用npx在Cline中配置

当项目发布到npm注册表后，你可以使用npx在Cline中配置MCP服务：

```json
"feishu-project-mcp": {
  "command": "npx",
  "args": [
    "feishu-project-mcp"
  ],
  "env": {
    "FEISHU_APP_ID": "your_app_id",
    "FEISHU_APP_SECRET": "your_app_secret",
    "FEISHU_API_URL": "https://project.feishu.cn/open_api"
  },
  "disabled": false,
  "alwaysAllow": [
    "health",
    "health.components",
    "health.integrations",
    "health.tasks",
    "health.memory",
    "feishu.projects",
    "feishu.requirements",
    "feishu.bugs",
    "task.create",
    "task.get",
    "mode.analyze",
    "mode.implement"
  ]
}
```

在发布之前，你应该使用完整路径：

```json
"feishu-project-mcp": {
  "command": "npx",
  "args": [
    "/absolute/path/to/feishu-project-mcp"
  ],
  "env": {
    "FEISHU_APP_ID": "your_app_id",
    "FEISHU_APP_SECRET": "your_app_secret",
    "FEISHU_API_URL": "https://project.feishu.cn/open_api"
  },
  "disabled": false,
  "alwaysAllow": [
    "health",
    "health.components",
    "health.integrations",
    "health.tasks",
    "health.memory",
    "feishu.projects",
    "feishu.requirements",
    "feishu.bugs",
    "task.create",
    "task.get",
    "mode.analyze",
    "mode.implement"
  ]
}
```

## API文档

### HTTP接口

#### 健康检查接口

```
GET /health
```

返回系统健康状态信息，包括组件状态、集成状态、任务状态和内存使用情况。

#### MCP工具接口

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

### MCP工具

#### 健康检查工具

- **health**: 获取完整的健康状态
- **health.components**: 获取组件健康状态
- **health.integrations**: 获取集成健康状态
- **health.tasks**: 获取任务健康状态
- **health.memory**: 获取内存使用情况

#### 飞书集成工具

- **feishu.projects**: 获取飞书项目列表
- **feishu.requirements**: 获取项目需求列表
- **feishu.bugs**: 获取项目缺陷列表

#### 任务管理工具

- **task.create**: 创建任务
- **task.get**: 获取任务详情

#### 模式工具

- **mode.analyze**: 分析需求或缺陷
- **mode.implement**: 实现需求或修复缺陷

## 工作流程示例

### 需求分析流程

1. 获取项目列表：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"tool":"feishu.projects"}' http://localhost:3000/mcp
```

2. 获取需求列表：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"tool":"feishu.requirements","params":{"projectId":"project1"}}' http://localhost:3000/mcp
```

3. 分析需求：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"tool":"mode.analyze","params":{"itemId":"requirement1","itemType":"requirement"}}' http://localhost:3000/mcp
```

4. 获取任务状态：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"tool":"task.get","params":{"taskId":"task1"}}' http://localhost:3000/mcp
```

## 开发指南

### 提交消息规范

本项目使用[Conventional Commits](https://www.conventionalcommits.org/)规范来格式化提交消息。每个提交消息都应该遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

其中：

- **type**: 表示提交的类型，如feat、fix、docs等
- **scope**: （可选）表示提交影响的范围，如core、server等
- **subject**: 简短描述提交的内容
- **body**: （可选）详细描述提交的内容
- **footer**: （可选）包含重大变更或关闭issue的信息

示例：

```
feat(server): add health check endpoint

Add a new endpoint to check the health of the server and its components.

Closes #123
```

项目中已经配置了commitlint和husky，会在提交前自动检查提交消息是否符合规范。你可以使用`.github/commit-template.txt`作为提交消息的模板。

### 代码风格

本项目使用ESLint和Prettier来保持代码风格的一致性。在提交代码前，会自动运行lint-staged来检查和修复代码风格问题。

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -am 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交Pull Request

## 许可证

本项目采用MIT许可证，详情请参阅[LICENSE](LICENSE)文件。

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- 提交Issue
- 发送邮件至：your-email@example.com
