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

## 发布到npm注册表

要将项目发布到npm注册表，请按照以下步骤操作：

### 准备工作

1. **创建npm账号**：如果你还没有npm账号，请先在[npm官网](https://www.npmjs.com/)注册一个账号。

2. **登录npm**：在本地终端登录npm：

   ```bash
   npm login
   ```

   按照提示输入用户名、密码和邮箱。

3. **检查package.json**：确保package.json文件包含以下必要字段：

   ```json
   {
     "name": "feishu-project-mcp",
     "version": "1.0.0",
     "description": "Feishu Project MCP Service for end-to-end requirement management and development automation",
     "type": "module",
     "main": "dist/index.js",
     "bin": {
       "feishu-project-mcp": "dist/cli.js"
     },
     "files": ["dist", "LICENSE", "README.md"],
     "keywords": [
       "feishu",
       "mcp",
       "project-management",
       "automation",
       "requirements",
       "development"
     ],
     "author": "Your Name <your.email@example.com>",
     "license": "MIT",
     "repository": {
       "type": "git",
       "url": "git+https://github.com/yourusername/feishu-project-mcp.git"
     },
     "bugs": {
       "url": "https://github.com/yourusername/feishu-project-mcp/issues"
     },
     "homepage": "https://github.com/yourusername/feishu-project-mcp#readme"
   }
   ```

4. **创建.npmignore文件**：创建.npmignore文件，指定不包含在npm包中的文件：
   ```
   .git
   .github
   .husky
   .vscode
   node_modules
   src
   tests
   .editorconfig
   .env*
   .eslintrc*
   .gitignore
   .lintstagedrc*
   .prettierrc
   commitlint.config.cjs
   docker-compose*
   Dockerfile*
   jest.config.cjs
   nodemon.json
   tsconfig.json
   ```

### 手动发布

1. **构建项目**：

   ```bash
   npm run build
   ```

2. **测试包**：在发布前，可以使用npm pack命令创建一个tarball，但不实际发布：

   ```bash
   npm pack
   ```

   这将创建一个名为`feishu-project-mcp-1.0.0.tgz`的文件。你可以在另一个目录中安装这个包进行测试：

   ```bash
   npm install /path/to/feishu-project-mcp-1.0.0.tgz
   ```

3. **发布包**：确认一切正常后，发布包：
   ```bash
   npm publish
   ```
   如果是第一次发布，可能需要添加`--access=public`参数：
   ```bash
   npm publish --access=public
   ```

### 使用GitHub Actions自动发布

1. **创建npm访问令牌**：

   - 登录npm网站
   - 点击右上角的头像，选择"Access Tokens"
   - 点击"Generate New Token"，选择"Automation"类型
   - 复制生成的令牌

2. **添加GitHub Secrets**：

   - 在GitHub仓库页面，点击"Settings"
   - 点击"Secrets and variables" > "Actions"
   - 点击"New repository secret"
   - 添加名为`NPM_TOKEN`的secret，值为刚才复制的npm令牌

3. **创建GitHub Actions工作流**：在仓库中创建`.github/workflows/npm-publish.yml`文件：

   ```yaml
   name: Publish to npm

   on:
     release:
       types: [created]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18.x'
             registry-url: 'https://registry.npmjs.org/'
         - run: npm ci
         - run: npm run build
         - run: npm test
         - run: npm publish
           env:
             NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
   ```

4. **创建GitHub Release**：
   - 在GitHub仓库页面，点击"Releases"
   - 点击"Create a new release"
   - 输入版本号（例如v1.0.0）
   - 添加发布说明
   - 点击"Publish release"

GitHub Actions将自动运行工作流，将包发布到npm。

### 使用语义化发布

如果你想更进一步自动化发布过程，可以使用semantic-release：

1. **安装semantic-release**：

   ```bash
   npm install --save-dev semantic-release @semantic-release/git @semantic-release/github @semantic-release/npm @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/release-notes-generator
   ```

2. **配置semantic-release**：创建`.releaserc.json`文件：

   ```json
   {
     "branches": ["main"],
     "plugins": [
       "@semantic-release/commit-analyzer",
       "@semantic-release/release-notes-generator",
       "@semantic-release/changelog",
       "@semantic-release/npm",
       "@semantic-release/github",
       "@semantic-release/git"
     ]
   }
   ```

3. **创建GitHub Actions工作流**：创建`.github/workflows/semantic-release.yml`文件：

   ```yaml
   name: Semantic Release

   on:
     push:
       branches: [main]

   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0
         - uses: actions/setup-node@v3
           with:
             node-version: '18.x'
             registry-url: 'https://registry.npmjs.org/'
         - run: npm ci
         - run: npm run build
         - run: npm test
         - run: npx semantic-release
           env:
             GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
             NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
   ```

### 版本更新

1. **手动更新版本**：使用npm version命令更新版本号：

   ```bash
   # 补丁版本更新 (1.0.0 -> 1.0.1)
   npm version patch

   # 次要版本更新 (1.0.0 -> 1.1.0)
   npm version minor

   # 主要版本更新 (1.0.0 -> 2.0.0)
   npm version major
   ```

   然后推送到GitHub并发布：

   ```bash
   git push --follow-tags
   npm publish
   ```

2. **使用semantic-release自动更新版本**：如果你使用semantic-release，只需按照Conventional Commits规范提交代码，semantic-release会自动确定版本号：
   - `fix:` 提交会触发补丁版本更新
   - `feat:` 提交会触发次要版本更新
   - 包含`BREAKING CHANGE:`的提交会触发主要版本更新

### 发布后的验证

发布成功后，你可以通过以下方式验证：

1. 在npm网站上搜索你的包名
2. 使用npx安装并运行你的包：
   ```bash
   npx feishu-project-mcp
   ```

### 更新README.md

发布成功后，更新README.md，添加npm徽章：

```markdown
[![npm version](https://img.shields.io/npm/v/feishu-project-mcp.svg)](https://www.npmjs.com/package/feishu-project-mcp)
[![npm downloads](https://img.shields.io/npm/dm/feishu-project-mcp.svg)](https://www.npmjs.com/package/feishu-project-mcp)
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
