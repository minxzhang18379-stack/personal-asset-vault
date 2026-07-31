# 🌩️ Cloudflare 部署与上线指引 (Cloudflare Deployment Guide)

本指南详细介绍了如何将 **个人资产管理系统 (Personal Asset Vault)** 部署到 **Cloudflare 免费平台 (Pages + Workers + D1 Database + R2 Object Storage)**。

---

## 📋 准备工作

1. 注册并登录 [Cloudflare 官网](https://dash.cloudflare.com/) 账号。
2. 安装 Node.js (v18+) 及 npm 环境。

---

## 🛠️ 步骤 1: 登录 Cloudflare CLI (Wrangler)

在项目根目录下打开终端，运行以下命令完成 Cloudflare CLI 授权认证：

```bash
npx wrangler login
```
终端会弹出浏览器窗口，点击 **Allow / 授权** 即可完成登录。

---

## 🗄️ 步骤 2: 创建 Cloudflare D1 数据库

运行以下命令在 Cloudflare 边缘创建 D1 SQLite 数据库：

```bash
npx wrangler d1 create asset-vault-db
```

命令执行成功后，终端会打印如下绑定提示信息：

```toml
[[d1_databases]]
binding = "DB"
database_name = "asset-vault-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

👉 **拷贝提示中的 `database_id`，粘贴替换项目根目录下 [wrangler.toml](file:///Volumes/SANDISK%20ELE/Manage%20mine%20property/wrangler.toml) 文件中的 `database_id` 属性。**

---

## 📜 步骤 3: 初始化数据库 Schema

运行以下脚本，将数据库建表脚本 [schema.sql](file:///Volumes/SANDISK%20ELE/Manage%20mine%20property/schema.sql) 同步到云端 Cloudflare D1 数据库：

```bash
npm run d1:init
```

系统会自动创建 `assets`, `consumables`, `locations`, `asset_attachments`, `asset_logs` 5 张表格。

---

## 📦 步骤 4: 创建 Cloudflare R2 对象存储 (存储发票/图片)

运行以下命令创建保存资产图片与凭证文件的 R2 Bucket：

```bash
npx wrangler r2 bucket create asset-vault-media
```

---

## ⚡ 步骤 5: 部署 Backend API 到 Cloudflare Workers

运行命令部署后端 Worker API (Hono 框架)：

```bash
npm run deploy
```

部署完成后，终端会显示部署好的 API 访问域名（例如：`https://personal-asset-vault.<your-subdomain>.workers.dev`）。

---

## 🚀 步骤 6: 部署 Frontend 到 Cloudflare Pages

运行以下构建与发布命令：

```bash
# 1. 编译前端静态产物 dist
npm run build

# 2. 发布至 Cloudflare Pages
npx wrangler pages deploy dist --project-name=personal-asset-vault
```

发布完成后，Cloudflare Pages 会自动分发 CDN，并生成专属域名（例如 `https://personal-asset-vault.pages.dev`）。

---

## 🔒 步骤 7: 设置防护与安全密码

系统默认密码为 `admin`。部署完成后，您可以通过 Cloudflare Workers 控制台的环境变量 (Environment Variables) 更改 `AUTH_PASSWORD` 和 `JWT_SECRET`，确保数据安全！

祝您使用愉快！
