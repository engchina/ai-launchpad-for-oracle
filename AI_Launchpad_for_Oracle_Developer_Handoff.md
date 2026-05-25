# AI Launchpad for Oracle — 开发交接技术方案

## 0. 文档目的

本文档用于交接给其他 AI 或开发者，作为后续开发 **AI Launchpad for Oracle** 的技术基线。

目标不是写一份市场介绍，而是明确：

- 产品最终形态
- 系统边界
- 推荐技术栈
- Web Platform、Browser Client、Local Connector 的职责分工
- Oracle / OCI 集成方式
- 安全原则
- 初始模块拆分
- MVP 到完整版本的开发路线
- 不与 Oracle 现有产品冲突的边界

---

## 1. 产品定位

## 1.1 产品名称

**AI Launchpad for Oracle**

## 1.2 一句话定义

AI Launchpad for Oracle 是一个面向 Oracle / OCI pre-sales、solution engineer、architect 和 PoC engineer 的销售促进平台，帮助用户更快完成客户需求分析、Oracle 方案选择、Demo 准备、PoC 构建、OCI / Database 环境检查、方案材料生成和客户跟进。

## 1.3 最终产品形态

最终不是单纯 Web 系统，也不是单纯 Browser。

最佳形态是：

```text
AI Launchpad for Oracle
= Web Sales Enablement Platform
+ AI Browser Client
+ Local OCI Connector
```

三者分工：

| 组件 | 角色 | 核心价值 |
|---|---|---|
| Web Platform | 中枢平台 | Playbook、客户机会、方案资产、PoC package、团队协作、分析 |
| Browser Client | 一线工作台 | Oracle Docs / OCI Console / LiveLabs / GitHub / Demo 现场辅助 |
| Local Connector | 本地桥接层 | OCI CLI、SQLcl、Wallet、本地文件、Terraform、PoC assets、本地安全检查 |

---

## 2. 明确非目标

本产品不是以下 Oracle 产品或平台的替代品：

- Oracle SQL Developer
- SQL Developer for VS Code
- OCI Console
- OCI Generative AI Agents
- Oracle AI Database Private Agent Factory
- Oracle AI Data Platform / AIDP
- AI Data Platform Workbench
- MLOps / LLMOps 平台
- Agent Runtime
- Agent Factory
- Data Governance Platform
- Lakehouse 管理平台
- OCI 资源管理平台
- 通用浏览器
- 通用 CRM
- 通用知识库

本产品定位为：

```text
Sales enablement platform
+ Pre-sales execution cockpit
+ Oracle AI adoption accelerator
+ PoC package generator
+ Demo cockpit
+ Oracle Docs / OCI Console companion
```

---

## 3. 为什么需要 Browser Client

Web Platform 可以做团队协作、资产沉淀和 Playbook 管理，但 Browser Client 有 Web 系统天然没有或体验明显更弱的能力。

Browser Client 的核心价值：

1. 感知当前 Oracle Docs / OCI Console / LiveLabs / GitHub 页面
2. 对当前页面直接总结、解释、提取步骤
3. 把选中文本直接变成客户说明、proposal 内容或 demo checklist
4. 在 OCI Console 旁边显示下一步、错误解释和配置 checklist
5. 一键截图并保存到客户 workspace
6. 在 demo 现场作为 cockpit 引导步骤
7. 把售前现场操作沉淀成团队资产
8. 与 Local Connector 结合，检查本地 OCI config、SQLcl、ADB Wallet、Terraform 等

没有 Browser Client 的影响：

- 产品会更像后台 Playbook / Proposal 系统
- 无法很好地贴近 Oracle Docs / OCI Console 现场
- 售前需要手动复制链接、截图、错误信息、配置参数
- Demo 现场引导能力弱
- 一线操作很难自然沉淀为组织资产
- 产品日常使用频率可能下降

---

## 4. 推荐整体架构

```text
┌──────────────────────────────────────────────────────────────┐
│                    AI Launchpad Web Platform                 │
│                                                              │
│  - Solution Playbook Library                                 │
│  - Customer Opportunity Workspace                            │
│  - PoC Package Generator                                     │
│  - Proposal Asset Library                                    │
│  - Demo Script Library                                       │
│  - Team Collaboration                                        │
│  - Approval / Review                                         │
│  - Analytics                                                 │
│  - Admin / Governance                                        │
└──────────────────────────────────────────────────────────────┘
                         ▲
                         │ Sync / API
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI Launchpad Browser Client               │
│                                                              │
│  - Electron + Chromium Browser Shell                         │
│  - Oracle Docs Companion                                     │
│  - OCI Console Companion                                     │
│  - Demo Cockpit                                              │
│  - AI Sidebar                                                │
│  - Page / Screenshot Capture                                 │
│  - Customer Workspace Cache                                  │
│  - Local Connector Bridge                                    │
└──────────────────────────────────────────────────────────────┘
                         ▲
                         │ localhost secure API / IPC
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Local OCI Connector                       │
│                                                              │
│  - OCI SDK / OCI CLI                                         │
│  - SQLcl                                                     │
│  - python-oracledb                                           │
│  - ADB Wallet Check                                          │
│  - Terraform / Resource Manager Helper                       │
│  - Local File Parsing                                        │
│  - Encrypted Local Workspace                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. 最推荐技术栈

## 5.1 Web Platform

| 层级 | 推荐技术 |
|---|---|
| Web Framework | Next.js |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| API Layer | Next.js Route Handlers / tRPC / REST |
| Database | PostgreSQL |
| ORM | Prisma / Drizzle |
| Object Storage | OCI Object Storage 或兼容 S3 API |
| Auth | OIDC / SSO / Auth.js / 企业 IAM 对接 |
| Vector Search | Oracle AI Vector Search / PostgreSQL pgvector / 可插拔 |
| Workflow | Temporal / BullMQ / 自研轻量 workflow |
| Search | OpenSearch / PostgreSQL full-text / Oracle Text |
| Analytics | ClickHouse / PostgreSQL / DuckDB offline export |
| Report Generation | Markdown + Mermaid + PDF renderer |
| Deployment | OCI Container Instances / OKE / Compute / App Service 形式 |

Next.js 是 React full-stack framework，适合作为 Web Platform 主框架。

## 5.2 Browser Client

| 层级 | 推荐技术 |
|---|---|
| Desktop Browser Shell | Electron |
| Browser Engine | Chromium via Electron |
| UI | React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Code Editor | Monaco Editor |
| State | Zustand |
| Server State | TanStack Query |
| Diagram | Mermaid + React Flow |
| Local IPC | Electron IPC |
| Local API | localhost FastAPI / Node service |
| Packaging | electron-builder / Electron Forge |
| Auto Update | electron-updater 或企业软件分发 |
| Testing | Playwright + Electron E2E |

Electron 内置 Chromium 和 Node.js，适合构建跨平台 browser-like desktop app，可运行在 Windows 和 macOS。

## 5.3 Local Connector

| 层级 | 推荐技术 |
|---|---|
| Runtime | Node.js + Python |
| Node Role | Electron main process、OCI TypeScript SDK、文件系统、Keychain |
| Python Role | FastAPI sidecar、OCI Python SDK、文档解析、RAG、Oracle DB 连接 |
| Local API | FastAPI |
| DB Driver | python-oracledb |
| Oracle CLI | OCI CLI |
| SQL Tool | SQLcl |
| IaC | Terraform / OCI Resource Manager |
| Local DB | SQLite / SQLCipher |
| Local Analytics | DuckDB |
| Secret Storage | OS Keychain |
| Encryption | SQLCipher / libsodium / OS-level keychain |

推荐采用 **Node.js + Python 双后端**：

- Node.js：更适合 Electron、本地系统、OCI TypeScript SDK、IPC、文件管理
- Python：更适合文档解析、RAG、OCI Python SDK、Oracle DB 连接、PoC 生成

---

## 6. Oracle / OCI 集成策略

## 6.1 不要在前端直接调用 OCI SDK

OCI TypeScript / JavaScript SDK 支持 Node.js，但不应直接在浏览器前端或普通 Web 页面里处理 OCI private key、config、token。

正确模式：

```text
Web UI / Browser UI
        ↓
Backend API / Local Connector
        ↓
OCI SDK / OCI CLI / Oracle DB
```

## 6.2 集成方式

| 集成目标 | 推荐方式 |
|---|---|
| OCI config 检查 | Local Connector 读取 `~/.oci/config` |
| Tenancy / Region / Compartment | OCI SDK |
| Object Storage | OCI SDK / OCI CLI |
| OCI Generative AI | OCI SDK / REST |
| OCI Generative AI Agents | SDK / REST / 配置模板 |
| Resource Manager | Terraform template + OCI SDK / CLI |
| ADB Wallet | Local Connector 文件检查 |
| SQLcl MCP | Local Connector 检查 SQLcl 和 MCP 配置 |
| Oracle DB 连接 | python-oracledb |
| Select AI / SQL | SQL script generator + SQLcl / DB connection |
| AI Vector Search | SQL generator + DB connection |
| Iceberg External Table | SQL generator + checklist |
| GitHub Sample | GitHub API / URL capture / local clone optional |

## 6.3 必须支持的 Oracle / OCI 场景

第一优先级：

- Oracle AI Database 26ai
- Oracle AI Vector Search
- Select AI
- SQLcl MCP
- OCI Generative AI
- OCI Generative AI Agents
- OCI Object Storage
- Autonomous Database / Autonomous AI Database
- ADB Wallet / mTLS
- OCI CLI / SDK
- Terraform / Resource Manager
- Oracle Docs / LiveLabs / GitHub sample

第二优先级：

- Iceberg external table
- Document Understanding
- AI Vision
- SQL Tool / RAG Tool readiness
- Data / schema annotation helper
- Proposal and PoC asset generation

---

## 7. 核心模块设计

## 7.1 Web Platform Modules

### 7.1.1 Solution Playbook Library

管理标准方案模板。

示例 playbook：

- RAG Chatbot on Oracle AI Database 26ai
- Oracle AI Vector Search Starter
- Select AI / NL2SQL
- SQLcl MCP Demo
- OCI Generative AI Agents with RAG Tool
- OCI Generative AI Agents with SQL Tool
- Document AI / Invoice Extraction
- Semantic Document Search
- Iceberg External Data Query from Autonomous AI Database
- AI-ready Schema Preparation

每个 playbook 应包含：

- 适用客户场景
- 目标业务价值
- 推荐 Oracle 服务
- 架构图
- 前提条件
- Demo 步骤
- PoC 步骤
- 常见错误
- 风险和限制
- 客户说明话术
- SQL / Python / Terraform / README 模板
- Follow-up email 模板
- Handover checklist

### 7.1.2 Customer Opportunity Workspace

每个客户机会一个 workspace。

字段：

- Customer name
- Industry
- Opportunity stage
- Customer pain points
- Technical requirements
- Selected playbooks
- Demo plan
- PoC assets
- Meeting notes
- Screenshots
- Architecture
- Risks
- Next actions
- Proposal sections
- Handover package

### 7.1.3 PoC Package Generator

根据客户需求和 playbook 生成可交付资产：

- README.md
- Architecture diagram
- SQL scripts
- Python sample
- Terraform template
- `.env.example`
- OCI setup checklist
- Validation checklist
- Troubleshooting guide
- Demo script
- Proposal section
- Follow-up email
- Handover document

### 7.1.4 Sales Enablement Analytics

统计：

- 哪些 playbook 使用最多
- 哪些场景最容易推进 PoC
- 哪些客户行业关注哪些 Oracle AI 功能
- PoC 常见失败点
- Demo 常见问题
- Proposal 复用率
- Follow-up 转化率
- 文档引用频次

---

## 7.2 Browser Client Modules

### 7.2.1 Oracle Docs Companion

当用户打开 Oracle Docs 时：

- 总结当前页面
- 提取操作步骤
- 提取限制条件
- 生成客户可读说明
- 生成 demo checklist
- 保存到当前 customer workspace
- 关联到 playbook
- 生成日英中三语说明

### 7.2.2 OCI Console Companion

当用户打开 OCI Console 时：

- 识别当前服务页面
- 给出下一步 checklist
- 解释当前配置项
- 解释错误信息
- 保存 region / compartment / OCID / endpoint
- 截图并保存到 workspace
- 生成配置记录
- 生成客户报告片段

注意：不要依赖脆弱的 Console DOM 自动点击。优先生成 checklist、CLI、Terraform、SDK sample。

### 7.2.3 Demo Cockpit

用于现场 demo：

- 当前 demo 步骤
- 下一步页面
- 要执行的 SQL / CLI
- 要展示的图
- 预期结果
- fallback screenshot
- 失败时说明话术
- 客户常见问题
- 一键生成 follow-up

### 7.2.4 Page Capture

支持：

- 保存当前页面
- 保存选中文本
- 保存当前 URL
- 保存 screenshot
- 保存代码片段
- 保存错误信息
- 自动关联 customer / playbook / demo step

### 7.2.5 AI Sidebar

提供：

- Ask about current page
- Explain selected text
- Turn page into checklist
- Turn error into troubleshooting
- Turn docs into customer explanation
- Generate proposal paragraph
- Generate demo script
- Compare with selected playbook
- Save answer to workspace

---

## 7.3 Local Connector Modules

### 7.3.1 OCI Readiness Checker

检查：

- OCI config 是否存在
- profile 是否可用
- tenancy / user / fingerprint
- region 是否正确
- compartment 可访问
- Object Storage bucket 可访问
- Generative AI model / endpoint 可访问
- IAM policy 是否缺失
- dynamic group 是否配置
- vault / key / secret 是否可用

### 7.3.2 Database Readiness Checker

检查：

- ADB wallet 是否存在
- connection string 是否可用
- DB user 权限
- DB version / feature availability
- VECTOR type / vector index capability
- DBMS_CLOUD / DBMS_CLOUD_AI
- SQLcl availability
- SQLcl MCP availability
- network / mTLS / private endpoint reachability

### 7.3.3 PoC Asset Builder

生成：

- SQL scripts
- Python code
- Terraform
- OCI CLI commands
- README
- Mermaid architecture
- Test data
- `.env.example`
- Docker compose optional
- Handover package

### 7.3.4 Document / RAG Helper

处理：

- PDF
- Word
- Markdown
- HTML
- CSV
- TXT
- Screenshots optional OCR
- Chunking preview
- Embedding pipeline
- Vector insert scripts
- Search test data
- RAG evaluation set

---

## 8. 安全原则

## 8.1 数据安全

- 客户数据默认保存在本地或受控 workspace
- 发送给 LLM 前必须显示数据范围
- 不自动发送 OCI private key、ADB wallet、password、token
- 支持脱敏
- 支持 workspace 加密
- 支持 local-only mode
- 支持 audit log
- 支持删除客户 workspace

## 8.2 Secret 管理

- OCI private key 不进入前端
- DB password 不进入前端
- Wallet 不进入 LLM prompt
- Secret 存 OS Keychain
- 本地 DB 使用 SQLCipher
- Web 平台使用 Vault / KMS
- 所有 connector 调用都要有最小权限原则

## 8.3 Oracle 产品边界

UI 和文档必须明确：

- 不替代 OCI Console
- 不替代 SQL Developer
- 不替代 Private Agent Factory
- 不替代 AIDP / AI Data Platform
- 不提供 production agent runtime
- 不提供 data governance platform
- 不做 OCI 资源自动大规模管理平台

---

## 9. 推荐 Repository 结构

```text
ai-launchpad-for-oracle/
├── apps/
│   ├── web/                         # Next.js Web Platform
│   ├── browser/                     # Electron Browser Client
│   └── local-connector/             # Python FastAPI + Node helpers
│
├── packages/
│   ├── ui/                          # Shared React components
│   ├── types/                       # Shared TypeScript types
│   ├── config/                      # Shared config
│   ├── prompts/                     # Prompt templates
│   ├── playbooks/                   # Built-in playbook definitions
│   ├── templates/                   # SQL / Python / Terraform templates
│   └── schemas/                     # Zod / JSON schemas
│
├── connectors/
│   ├── oci/                         # OCI SDK wrappers
│   ├── oracle-db/                   # DB connection helpers
│   ├── sqlcl/                       # SQLcl helpers
│   ├── terraform/                   # Terraform / Resource Manager helpers
│   └── github/                      # GitHub sample integrations
│
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── security/
│   ├── api/
│   └── playbook-authoring/
│
├── infra/
│   ├── terraform/
│   ├── docker/
│   └── oci/
│
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
│
└── README.md
```

---

## 10. 数据模型草案

## 10.1 Workspace

```ts
type Workspace = {
  id: string
  name: string
  customerName: string
  opportunityStage: string
  industry?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}
```

## 10.2 Requirement

```ts
type Requirement = {
  id: string
  workspaceId: string
  source: "manual" | "meeting" | "selected_text" | "uploaded_doc"
  content: string
  extractedPainPoints: string[]
  extractedTechnicalNeeds: string[]
  recommendedPlaybookIds: string[]
}
```

## 10.3 Playbook

```ts
type Playbook = {
  id: string
  title: string
  oracleServices: string[]
  targetUseCases: string[]
  prerequisites: string[]
  steps: PlaybookStep[]
  assets: PlaybookAsset[]
  risks: string[]
  faq: FAQ[]
}
```

## 10.4 CapturedPage

```ts
type CapturedPage = {
  id: string
  workspaceId: string
  url: string
  title: string
  sourceType: "oracle_docs" | "oci_console" | "livelabs" | "github" | "customer_site" | "other"
  selectedText?: string
  summary?: string
  screenshotPath?: string
  linkedPlaybookId?: string
  createdAt: string
}
```

## 10.5 GeneratedAsset

```ts
type GeneratedAsset = {
  id: string
  workspaceId: string
  type: "readme" | "sql" | "python" | "terraform" | "proposal" | "email" | "diagram" | "checklist"
  title: string
  content: string
  sourceRefs: string[]
  createdAt: string
}
```

---

## 11. API 边界

## 11.1 Web Platform API

示例：

```http
POST /api/workspaces
GET  /api/workspaces/:id
POST /api/workspaces/:id/requirements
POST /api/workspaces/:id/captured-pages
POST /api/workspaces/:id/generated-assets
GET  /api/playbooks
GET  /api/playbooks/:id
POST /api/solution/recommend
POST /api/assets/generate
POST /api/reports/export
```

## 11.2 Browser Client → Web Platform

Browser Client 应能调用：

```http
POST /api/browser/save-page
POST /api/browser/save-selection
POST /api/browser/save-screenshot
POST /api/browser/ask-page
POST /api/browser/link-to-workspace
GET  /api/browser/current-playbook
```

## 11.3 Browser Client → Local Connector

本地 API 示例：

```http
GET  http://127.0.0.1:<port>/health
POST http://127.0.0.1:<port>/oci/check-config
POST http://127.0.0.1:<port>/oci/check-object-storage
POST http://127.0.0.1:<port>/db/check-wallet
POST http://127.0.0.1:<port>/db/check-connection
POST http://127.0.0.1:<port>/sqlcl/check
POST http://127.0.0.1:<port>/assets/generate-poc
POST http://127.0.0.1:<port>/docs/parse
POST http://127.0.0.1:<port>/rag/chunk-preview
```

Local Connector 只监听 localhost，并要求 Browser Client 提供 session token。

---

## 12. MVP 范围

## 12.1 MVP 目标

MVP 的目标是验证：

> AI Launchpad for Oracle 是否能帮助 pre-sales 更快从客户需求生成 Oracle AI 方案、demo plan 和 PoC package。

## 12.2 MVP 必做

### Web Platform

- Customer Workspace
- Requirement input
- Solution Playbook Library
- Solution Path Recommendation
- PoC Package Generator
- Proposal Section Generator
- README / Markdown export

### Browser Client

- Oracle Docs AI Sidebar
- Save current page to workspace
- Save selected text to workspace
- Page summary
- Extract checklist
- Demo Cockpit basic view
- Screenshot capture basic

### Local Connector

- OCI config checker
- Object Storage checker
- ADB wallet checker
- SQLcl checker
- Basic SQL / Python / Terraform template generator

## 12.3 MVP 不做

- 完整 OCI Console 自动操作
- 完整 Agent lifecycle management
- 完整 AI Data Platform
- 完整治理 / 审计平台
- 通用 CRM
- 大规模资源自动部署
- 完整 Lakehouse 管理
- 完整 SQL Developer 替代

---

## 13. 完整版本 Roadmap

## Phase 1: Web Platform Core

- Workspace
- Playbooks
- Requirement extraction
- Solution recommendation
- Proposal generator
- PoC package generator

## Phase 2: Browser Client

- Electron Browser
- Oracle Docs Companion
- OCI Console Companion
- Demo Cockpit
- Screenshot / Page Capture
- Sync with Web Platform

## Phase 3: Local Connector

- OCI config readiness
- ADB wallet readiness
- SQLcl readiness
- Terraform generation
- Local encrypted workspace
- PoC package export

## Phase 4: Oracle AI Deep Integration

- Oracle AI Vector Search starter
- Select AI helper
- SQLcl MCP helper
- OCI Generative AI helper
- OCI Generative AI Agents readiness helper
- Object Storage / RAG pipeline helper

## Phase 5: Sales Analytics

- Playbook usage analytics
- Opportunity insight
- Common failure points
- Demo success tracking
- Proposal reuse analytics
- Team best-practice library

---

## 14. 开发给 AI 的任务拆分建议

可以让不同 AI / agent 分别开发：

### Agent A: Web Platform

负责：

- Next.js app
- Prisma schema
- Workspace CRUD
- Playbook library
- Asset generator UI
- Auth skeleton

### Agent B: Browser Client

负责：

- Electron shell
- Browser tab UI
- AI sidebar
- page capture
- screenshot
- workspace sync

### Agent C: Local Connector

负责：

- FastAPI server
- OCI config checker
- ADB wallet checker
- SQLcl checker
- template generation
- local encrypted workspace

### Agent D: Playbook / Template

负责：

- RAG playbook
- Vector Search playbook
- Select AI playbook
- SQLcl MCP playbook
- OCI Agents readiness playbook
- Iceberg external data playbook
- SQL / Python / Terraform templates

### Agent E: Security

负责：

- secret handling
- keychain
- local encryption
- permission model
- audit logging
- safe LLM prompt policy

### Agent F: Testing

负责：

- Playwright E2E
- Electron tests
- API tests
- connector integration tests
- fixture data

---

## 15. 参考资料

以下资料用于技术选型依据：

- Electron 官方：Electron 基于 Chromium 和 Node.js，可构建 macOS、Windows、Linux 跨平台桌面应用。
- Next.js 官方：Next.js 是用于构建 full-stack web applications 的 React framework。
- OCI TypeScript / JavaScript SDK：用于 Node.js 环境调用 OCI 服务；不要把 OCI private key 放到浏览器前端。
- OCI Python SDK：用于管理 OCI resources，适合 Local Connector / Python sidecar。
- Playwright：支持 Chromium、WebKit、Firefox，以及 Google Chrome 和 Microsoft Edge。
- OCI Resource Manager：基于 Terraform 管理 OCI resources，适合作为 PoC package / deployment asset 输出目标。
- Oracle Docs / OCI Docs / LiveLabs：作为 Browser Client 页面增强和 Playbook 来源。
