# 个人资产管理系统 (Personal Asset Vault)

基于 React 18 与 Cloudflare 边缘架构 (Pages + Workers + D1 + R2) 构建的个人与家庭资产管理系统，提供固定资产全生命周期管理、每日使用成本摊销、开销统计分析、空间收纳及安全鉴权功能。

---

## 功能特性

### 1. 开销统计与账单分析
- **开销指标统计**：统计月度支出总额、日均支出、经常性固定支出（房租、水电、订阅服务）及账单笔数，计算环比变动。
- **图表可视化**：提供 6 个月历史开销趋势图 (AreaChart) 与分类支出占比图 (PieChart)。
- **账单管理**：支持开销记账、分类筛选、经常性支出标记与条件检索。

### 2. 每日持用成本摊销
- **持用成本计算**：基于资产购置原价与持有时间，计算每日均摊成本（$\text{原价} / \text{持用天数}$）。
- **成本排序**：按日均使用成本排序展示高投入与高使用率资产。

### 3. 图标库与极简界面
- **36 款矢量图标**：涵盖数码电子、交通工具、家居用品、奢品藏品及证书契约等类别。
- **纯正功能界面**：移除修饰性文本，保留清晰的功能标注与交互控制。

### 4. 资产档案与折旧估算
- **资产档案记录**：记录大类、购买原价、买入日期、品牌型号及序列号。
- **动态折旧计算**：内置复合折旧模型，计算资产当前估值、累计折旧与残值率。
- **凭证存储**：支持上传实物照片、发票及质保卡至 Cloudflare R2 对象存储。

### 5. 维保与耗材预警
- **保修到期提醒**：临近 30 天保修到期的资产自动进行预警提示。
- **耗材库存追踪**：监控快消耗材数量与保质期，低于警戒库存时自动提醒。

### 6. 安全鉴权与审计日志
- **密码加密存储**：使用 Web Crypto API (SHA-256 带盐) 进行密码哈希，支持多账号权限控制。
- **初始密码重置与失效机制**：使用初始密码登录后提示修改密码，完成自定义新密码设置后，初始密码通道作废。
- **安全恢复与日志**：提供应急安全恢复密钥，记录 180 天合规操作审计日志。

### 7. 统一布局与侧边栏控制
- **顶栏清理**：子页面顶部不再保留多余设置按钮，统一收纳于侧边栏左下角控制区。

---

## 技术架构

```
                     ┌───────────────────────────────────────────┐
                     │     React 18 + Tailwind CSS (Vite SPA)    │
                     └─────────────────────┬─────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        ┌──────────────────────────────┐    ┌──────────────────────────────────┐
        │  Cloudflare Workers (Hono)   │    │      本地离线存储与 Mock 引擎       │
        │     Production REST API      │    │         (LocalStorage)           │
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

## 开发与运行

### 1. 克隆仓库
```bash
git clone https://github.com/minxzhang18379-stack/personal-asset-vault.git
cd personal-asset-vault
```

### 2. 安装依赖
```bash
npm install
```
> 外置移动硬盘环境 (exFAT) 请附加 `--no-bin-links` 参数。

### 3. 本地开发服务
```bash
npm run dev
```
访问 `http://localhost:3000`。默认管理员账户初始密码为 `admin`。

---

## 部署流程

### 部署至 Cloudflare Pages & Workers

```bash
# 1. 登录 Cloudflare CLI
npx wrangler login

# 2. 创建 D1 数据库
npx wrangler d1 create asset-vault-db

# 3. 执行建表脚本
npm run d1:init

# 4. 创建 R2 存储桶
npx wrangler r2 bucket create asset-vault-media

# 5. 部署 Worker
npm run deploy

# 6. 构建并部署前端至 Pages
npm run build
npx wrangler pages deploy dist --project-name=personal-asset-vault
```

---

## 目录结构

```
├── README.md               # 项目说明文档
├── DEPLOYMENT.md           # 部署指南
├── CODING_STANDARDS.md     # 代码规范说明
├── schema.sql              # D1 数据库建表 Schema
├── wrangler.toml           # Wrangler 配置
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── src/
│   ├── main.jsx            # 应用入口
│   ├── App.jsx             # 主框架与导航
│   ├── index.css           # 全局样式
│   ├── api/
│   │   └── worker.js       # Hono API (Cloudflare Workers)
│   ├── context/
│   │   └── AssetContext.jsx# 全局数据与 UI 状态 Context
│   ├── utils/
│   │   ├── costCalculator.js # 每日持用成本计算
│   │   ├── securityCrypto.js # SHA-256 加密工具
│   │   └── logger.js         # 审计日志工具
│   ├── services/
│   │   ├── apiService.js   # API 服务封装
│   │   └── mockDataService.js # 离线 Mock 数据
│   └── components/
│       ├── Dashboard.jsx   # 财务大盘
│       ├── AssetList.jsx   # 资产档案列表
│       ├── ExpenseView.jsx # 开销统计视图
│       ├── ExpenseFormModal.jsx # 开销记账弹窗
│       ├── ConsumablesTracker.jsx # 快消耗材追踪
│       ├── LocationManager.jsx  # 空间收纳管理
│       ├── AnalyticsView.jsx    # 财务分析报告
│       ├── UserSecurityModal.jsx # 安全与账号管理弹窗
│       ├── AuditLogModal.jsx    # 审计日志弹窗
│       ├── PasswordRecoveryModal.jsx # 安全恢复弹窗
│       ├── AssetDetailModal.jsx # 资产详情弹窗
│       ├── AssetFormModal.jsx   # 资产编辑弹窗
│       └── SettingsModal.jsx    # 系统设置弹窗
```

---

## 许可协议
MIT License
