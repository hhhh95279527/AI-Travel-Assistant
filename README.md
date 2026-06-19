# ✈️ 旅途 · AI 旅行规划助手

基于 **NestJS 11 + LangGraph + Vue3** 构建的 AI 旅行规划助手，8 个专业工具协同工作。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | NestJS 11 |
| AI 框架 | LangChain.js + LangGraph |
| 大模型 | Ollama（本地）/ DeepSeek（云端）二选一 |
| 流式输出 | SSE（Server-Sent Events）|
| 前端框架 | Vue3 Composition API + setup 语法糖 |
| 状态管理 | Pinia |
| UI 组件 | Element Plus |

## 8 个旅行工具

| 工具 | 功能 |
|------|------|
| 🌤️ 天气查询 | 目的地实时天气 + 穿衣建议 |
| 🏛️ 景点推荐 | 12+ 城市内置数据库 |
| 📅 行程规划 | 逐日详细行程（AI生成）|
| 💰 预算估算 | 住宿/餐饮/交通/门票分项 |
| 📋 签证查询 | 12+ 目的地签证信息 |
| 💱 货币换算 | 20+ 货币 + 消费参考 |
| 🎒 打包清单 | 按季节/活动定制 |
| 🗣️ 旅行翻译 | 常用短语 + 发音指导 |

---

## 🚀 快速启动

### 第一步：配置大模型（二选一）

**方式一：本地 Ollama（推荐，免费）**

```bash
# 1. 安装 Ollama（https://ollama.com/download）
# 2. 拉取模型
ollama pull qwen3.5:0.8b
# 3. 确认 .env 配置（默认已配置 Ollama）
```

**方式二：DeepSeek API**

```bash
# 1. 注册 https://platform.deepseek.com 获取 API Key
# 2. 编辑 backend/.env，注释 Ollama 三行，取消注释 DeepSeek 三行，填入 API Key
```

### 第二步：启动后端

```bash
cd backend
npm install
cp .env.example .env   # 首次使用
# 编辑 .env 选择大模型方式
npm run start:dev
```

看到以下输出说明启动成功：
```
🤖 大模型：Ollama 本地 → qwen3.5:0.8b
✅ 旅途 AI 服务已启动：http://localhost:3000
```

### 第三步：启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 **http://localhost:5173** 即可使用。

---

## 📁 项目结构

```
travel-agent/
├── backend/                   ← NestJS 后端
│   ├── src/
│   │   ├── agent/             ← LangGraph Agent
│   │   ├── tools/             ← 8 个旅行工具
│   │   ├── memory/            ← 对话记忆
│   │   └── config.ts          ← 模型配置（在这里切换模型）
│   └── .env.example
│
└── frontend/                  ← Vue3 前端
    ├── src/
    │   ├── components/        ← 聊天组件
    │   ├── views/             ← 页面视图
    │   ├── stores/            ← Pinia 状态
    │   └── api/               ← API 封装
    └── vite.config.js
```

## 🔧 切换大模型

只需编辑 `backend/.env` 文件：

```env
# 使用 Ollama（本地，默认）
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen3.5:0.8b

# 使用 DeepSeek（云端，注释上面3行，取消注释下面3行）
# LLM_PROVIDER=deepseek
# DEEPSEEK_API_KEY=sk-你的密钥
# DEEPSEEK_MODEL=deepseek-chat
```

修改后重启后端即可，前端和代码无需任何改动。
