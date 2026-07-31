# 个人资产与财产管理系统 (Cloudflare Personal Asset Vault)

![Cloudflare Asset Vault](https://img.shields.io/badge/Hosting-Cloudflare_Pages_%26_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-React_18_%7C_Tailwind_CSS_%7C_Hono-0284c7?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-Cloudflare_D1_(SQLite)-0265d2?style=for-the-badge)
![Standards](https://img.shields.io/badge/Standards-Lyrasoft_Coding_Standards-10b981?style=for-the-badge)

一个兼具**极高视觉质感**与**强劲实用功能**的个人与家庭资产金库管理系统，完整托管于 **Cloudflare 边缘架构 (Pages + Workers + D1 SQLite + R2 对象存储)**。

本系统全维度覆盖从**耐用高价值资产**（手机、电脑、机械手表、汽车、房产）到**日常快消耗材**（咖啡胶囊、护肤化妆品、日用备件保质期）的全生命周期管理、每日持用成本摊销计算、折旧保值估算及保修到期预警。

---

## 🌟 核心功能亮点 (Core Features)

### 1. 🔥 每日持用成本计算 (Daily Cost of Use)
- **精准摊销模型**：结合资产购入时间与原价，自动计算累计持用天数与每日均摊成本（$\text{原价} / \text{持用天数}$）。
- **性价比排行榜**：支持按照“日均使用成本”降序排列全库资产，直观了解每天最花钱的科技产品与耐用品。

### 2. 🍏 Apple 官方 SF 风格图标与自定义图标库
- **SF Symbols 矢量图标**：全量卡片与明细表配备高清 Apple 风格矢量图标（如 iPhone 手机、MacBook 电脑、Tesla 汽车、腕表、服饰等）。
- **个性化自定义**：支持在新增/编辑资产时自定义选择 14+ 种科技与常用图标，留空时智能自动退化匹配。

### 3. 💎 动态折旧估算与全维度资产档案
- **耐用财产追踪**：记录资产大类、购买原价、买入日期、品牌型号及 S/N 序列号。
- **动态折旧计算**：内置年化复合折旧算法，自动计算当前估值、累计折旧损耗率与残值留存。
- **凭证与照片图库**：支持上传实物多视角照片、发票收据凭证及保修卡（对接 Cloudflare R2）。

### 4. ⏳ 保修到期与快消耗材防线预警
- **保修期倒计时**：临近 30 天保修到期自动在控制台提示，防止错过官方质保与免费维保。
- **快消耗材库存追踪**：实时监控咖啡胶囊、护肤品、食品保质期与备用耗材，低于阈值自动触发预警。

### 5. 🏠 视觉化收纳空间与层级位置导航
- **空间柜屉绑定**：自定义收纳地点（如：主卧衣柜、书房抽屉、保险箱、车库），一键检索特定空间存放的所有资产与物品。

### 6. 📊 极具质感的财务数据可视化
- **总资产大盘**：实时展示净资产估值总额、历史投入成本与折旧损耗。
- **Recharts 多维图表**：资产分类价值占比饼图、各年份买入资产保值演变趋势图及 Top 5 保值率排行榜。

### 7. 🛡️ 离线 Demo + Cloudflare 双模式无缝切换
- **零配置开箱即用**：本地开发与演示时内置 Mock 数据与 LocalStorage 存储，无需配置 Cloudflare 账号即可极速体验。
- **云端原生扩展**：提供完整 Hono Worker 源码与 `wrangler.toml` 绑定脚本，可随时一键部署至 Cloudflare 生产环境。

---

## 🎨 排版与代码规范 (Lyrasoft Standards Compliance)

本项目严格遵循 [Lyrasoft Coding Standards](https://github.com/lyrasoft/coding-standards) 及 [Lyrasoft 中文 CSS 排版原则指南 (chinese.md)](https://github.com/lyrasoft/coding-standards/blob/master/chinese.md)：
- **16px 视口基准与行距**：使用 16px 基础字号与 1.6 行距，保障大屏中文长文平滑阅读体验。
- **跨平台中文字体降级链**：内置 `Plus Jakarta Sans` 搭配 Mac `PingFang SC/TC` 与 Windows `Microsoft YaHei` 无缝降级。
- **标题字重与高对比度**：H1~H6 标题统一采用 `700/800` 粗字重，所有浮动 Tooltip 与文字确保 100% 高对比度读写。

---

## 🏗️ 架构与技术栈 (Technology Stack)

```
                     ┌───────────────────────────────────────────┐
                     │     React 18 + Tailwind CSS (Vite SPA)    │
                     │  (Modern Glassmorphism UI & Recharts)     │
                     └─────────────────────┬─────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        ┌──────────────────────────────┐    ┌──────────────────────────────────┐
        │  Cloudflare Workers (Hono)   │    │  Local Demo / Offline Engine     │
        │     Production REST API      │    │    (IndexedDB & LocalStorage)    │
        └──────────────┬───────────────┘    └──────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐              ┌────────────────┐
│ Cloudflare D1│              │  Cloudflare R2 │
│ (SQLite DB)  │              │ (Object Storage│
│  Schema.sql  │              │  Photos & Docs)│
└──────────────┘              └────────────────┘
```

---

## 🚀 快速开始与本地运行 (Quick Start)

### 1. 克隆项目
```bash
git clone https://github.com/your-username/personal-asset-vault.git
cd personal-asset-vault
```

### 2. 安装依赖
```bash
npm install
```
> 💡 **外置移动硬盘 (exFAT) 提示**：若在外置移动硬盘运行 `npm install` 报符号链接错误，请使用：
> `npm install --no-bin-links`

### 3. 启动本地开发服务 (包含离线 Mock 预置数据)
```bash
npm run dev
```
打开浏览器访问 `http://localhost:3000` 即可直接体验！初始守护密码：`admin`。

---

## ☁️ Cloudflare 部署步骤 (Cloudflare Deployment Guide)

详细的 Cloudflare Pages & Workers 部署指南，请查看 [DEPLOYMENT.md](DEPLOYMENT.md)。

一键部署命令概要：
```bash
# 1. 登录 Cloudflare Wrangler CLI
npx wrangler login

# 2. 创建 Cloudflare D1 数据库
npx wrangler d1 create asset-vault-db

# 3. 初始化数据库 Schema 建表
npm run d1:init

# 4. 创建 R2 Bucket 对象存储
npx wrangler r2 bucket create asset-vault-media

# 5. 部署 Cloudflare Worker
npm run deploy

# 6. 构建并部署前端至 Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name=personal-asset-vault
```

---

## 📁 目录结构 (Directory Structure)

```
├── README.md               # GitHub 主文档
├── DEPLOYMENT.md           # Cloudflare 部署指南
├── CODING_STANDARDS.md     # Lyrasoft 代码与排版规范说明
├── schema.sql              # D1 SQLite 数据库建表 Schema
├── wrangler.toml           # Cloudflare Wrangler 配置文件
├── package.json            # 依赖与脚本
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 视觉主题
├── src/
│   ├── main.jsx            # React 页面入口
│   ├── App.jsx             # 响应式主框架与侧边栏导航
│   ├── index.css           # 全局 CSS 与毛玻璃 Glassmorphism 样式
│   ├── api/
│   │   └── worker.js       # Hono REST API (运行在 Cloudflare Workers)
│   ├── context/
│   │   └── AssetContext.jsx# 全局解耦领域数据与 UI 状态 Context
│   ├── utils/
│   │   └── costCalculator.js # 每日持用成本 (Daily Cost of Use) 计算工具
│   ├── services/
│   │   ├── apiService.js   # 生产/Mock API 切换服务
│   │   └── mockDataService.js # 离线 Mock 预置资产数据
│   └── components/
│       ├── Dashboard.jsx   # 资产财务大盘 (四项卡片 + Recharts 图表)
│       ├── AssetList.jsx   # 资产档案列表、Apple 图标与卡片网格
│       ├── AssetDetailModal.jsx # 资产详情与每日成本分析 Modal
│       ├── AssetFormModal.jsx   # 资产登记/编辑与图标选择器 Modal
│       ├── ConsumablesTracker.jsx # 耗材与快消品追踪
│       ├── LocationManager.jsx  # 空间收纳导航
│       ├── AnalyticsView.jsx    # 财务与保值率深入分析报告
│       ├── ToastNotification.jsx# 操作结果微光 Toast 通知
│       ├── EmptyState.jsx       # 极具质感的空状态引导组件
│       └── SettingsModal.jsx    # 系统设置、数据备份与一键彻底清空
```

---

## 📄 License
MIT License
