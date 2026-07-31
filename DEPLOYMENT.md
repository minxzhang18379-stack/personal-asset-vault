# Cloudflare 部署指南 (Deployment Guide)

本文档说明如何将个人资产管理系统部署至 Cloudflare 平台 (Pages + Workers + D1 Database + R2 Object Storage)。

---

## 准备工作

1. 注册并登录 Cloudflare 账号。
2. 确保本地安装 Node.js (v18+) 环境。

---

## 部署步骤

### 1. 登录 Wrangler CLI

```bash
npx wrangler login
```
系统将自动打开浏览器授权页面，确认授权完成登录。

---

### 2. 创建 D1 数据库

运行以下命令创建 D1 SQLite 数据库：

```bash
npx wrangler d1 create asset-vault-db
```

命令完成后，控制台将输出类似如下信息：

```toml
[[d1_databases]]
binding = "DB"
database_name = "asset-vault-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

复制输出结果中的 `database_id`，更新到项目根目录下的 `wrangler.toml` 文件中。

---

### 3. 初始化数据库 Schema

同步数据库建表文件 `schema.sql` 至 Cloudflare D1：

```bash
npm run d1:init
```

脚本将创建应用所需的数据表。

---

### 4. 创建 R2 存储桶

运行以下命令创建用于存放附件与图片的 R2 Bucket：

```bash
npx wrangler r2 bucket create asset-vault-media
```

---

### 5. 部署 API 服务 (Cloudflare Workers)

运行以下命令部署基于 Hono 的 Worker API：

```bash
npm run deploy
```

发布完成后，命令行将输出 Worker 的访问入口 URL。

---

### 6. 构建并部署前端 (Cloudflare Pages)

编译前端打包文件并发布至 Cloudflare Pages：

```bash
npm run build
npx wrangler pages deploy dist --project-name=personal-asset-vault
```

发布成功后将获得 Pages 分发域名（例如 `https://personal-asset-vault.pages.dev`）。

---

### 7. 环境配置

初始系统登录密码为 `admin`。部署完成后，可通过 Cloudflare Workers 控制台的环境变量设置修改 `AUTH_PASSWORD` 及 `JWT_SECRET` 配置项。
