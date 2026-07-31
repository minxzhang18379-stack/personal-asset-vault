# 个人资产与财产管理系统 (Cloudflare Personal Asset Vault)

![Cloudflare Asset Vault](https://img.shields.io/badge/Hosting-Cloudflare_Pages_%26_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-React_18_%7C_Tailwind_CSS_%7C_Hono-0284c7?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-Cloudflare_D1_(SQLite)-0265d2?style=for-the-badge)
![Standards](https://img.shields.io/badge/Standards-Lyrasoft_Coding_Standards-10b981?style=for-the-badge)

一个兼具**极高视觉质感**与**强劲实用功能**的个人与家庭资产金库管理系统，完整托管于 **Cloudflare 边缘架构 (Pages + Workers + D1 SQLite + R2 对象存储)**。

本系统全维度覆盖从**耐用高价值资产**（手机、电脑、机械手表、汽车、房产）到**日常快消耗材**（咖啡胶囊、护肤化妆品、日用备件保质期）的全生命周期管理、每日持用成本摊销计算、折旧保值估算、每月开销统计及保修到期预警。

---

## 🌟 核心功能亮点 (Core Features)

### 1. 💳 每月开销统计与账单分析 (Monthly Expense Tracker)
- **4 项核心财务指标**：当月总支出（含环比 +-% 提示）、日均支出额、经常性固定支出（房租/水电/iCloud/包月订阅）及账单笔数。
- **双重可视化图表 (Recharts)**：近 6 个月开销趋势渐变面积图 (`AreaChart`) 与当月分类开销占比环形图 (`PieChart`)。
- **快捷记账与分类过滤**：支持自定义开销分类、经常性支出标记与多条件组合检索。

### 2. 🔥 每日持用成本计算 (Daily Cost of Use)
- **精准摊销模型**：结合资产购入时间与原价，自动计算累计持用天数与每日均摊成本（$\text{原价} / \text{持用天数}$）。
- **性价比排行榜**：支持按照“日均使用成本”降序排列全库资产，直观了解每天最花钱的科技产品与耐用品。

### 3. 🍏 36 款 Apple 官方 SF 风格矢量图标库
- **全大类 SF 风格图标**：涵盖数码电子（iPhone/Mac/iPad/音响）、出行交通（汽车/骑行/航模）、家居生活（房产/床品/名酒）、奢品收藏（珠宝/藏品/皮具）及密匣保单等 36 款图标。
- **极简文本**：全站摒弃所有修饰性修饰词，保留直观、聚焦的控件标签。

### 4. 💎 动态折旧估算与全维度资产档案
- **耐用财产追踪**：记录资产大类、购买原价、买入日期、品牌型号及 S/N 序列号。
- **动态折旧计算**：内置年化复合折旧算法，自动计算当前估值、累计折旧损耗率与残值留存。
- **凭证与照片图库**：支持上传实物多视角照片、发票收据凭证及保修卡（对接 Cloudflare R2）。

### 5. ⏳ 保修到期与快消耗材防线预警
- **保修期倒计时**：临近 30 天保修到期自动在控制台提示，防止错过官方质保与免费维保。
- **快消耗材库存追踪**：实时监控咖啡胶囊、护肤品、食品保质期与备用耗材，低于阈值自动触发预警。

### 6. 🔒 独立安全鉴权与 180 天合规审计日志 (Web Crypto SHA-256)
- **全站 SHA-256 盐值哈希**：支持主超级管理员与独立成员账号鉴权，全端配备智能剪贴板多设备粘贴容错与旧数据热修复。
- **应急安全密钥与 180 天日志**：内置应急安全恢复密钥及 180 天合规日志追踪，全量监控资产增删改与鉴权变动。

### 7. 🎯 侧边栏左下角统一控制 (Unified Layout)
- **顶栏全清设计**：所有子页面 Header 均已剥离多余 Settings 图标，统一收纳在侧边栏左下角用户卡片与纯图标按钮（`[⚙️]` 设置 & `[🚪]` 退出）中，保障多端一致体验。

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
│   │   ├── costCalculator.js # 每日持用成本 (Daily Cost of Use) 计算工具
│   │   ├── securityCrypto.js # Web Crypto API SHA-256 安全加密工具
│   │   └── logger.js         # 180 天合规日志审计记录器
│   ├── services/
│   │   ├── apiService.js   # 生产/Mock API 切换服务
│   │   └── mockDataService.js # 离线 Mock 预置资产数据
│   └── components/
│       ├── Dashboard.jsx   # 资产财务大盘 (四项卡片 + Recharts 图表)
│       ├── AssetList.jsx   # 资产档案列表、36 款 Apple 图标与卡片网格
│       ├── ExpenseView.jsx # 开销统计主视图 (4 项指标 + 双重 Recharts 图表)
│       ├── ExpenseFormModal.jsx # 开销记账与编辑模态框
│       ├── ConsumablesTracker.jsx # 耗材与快消品追踪
│       ├── LocationManager.jsx  # 空间收纳导航
│       ├── AnalyticsView.jsx    # 财务与保值率深入分析报告
│       ├── UserSecurityModal.jsx # 密码修改与成员账号安全管理 Modal
│       ├── AuditLogModal.jsx    # 180 天合规审计日志查看 Modal
│       ├── PasswordRecoveryModal.jsx # 应急安全密钥恢复 Modal
│       ├── AssetDetailModal.jsx # 资产详情与每日成本分析 Modal
│       ├── AssetFormModal.jsx   # 资产登记/编辑 Modal
│       └── SettingsModal.jsx    # 系统设置、数据备份与一键彻底清空
```

---

## 📄 License
MIT License

