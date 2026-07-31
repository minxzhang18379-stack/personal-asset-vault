# 📋 软体工程编码规范 (Lyrasoft & vxhly Web Font Standards)

本项目遵循并参考 [Lyrasoft Coding Standards](https://github.com/lyrasoft/coding-standards)、[Lyrasoft 中文 CSS 排版原则指南 (chinese.md)](https://github.com/lyrasoft/coding-standards/blob/master/chinese.md) 以及 [vxhly Web 网页设计规范 (web-字体要求)](https://vxhly.github.io/views/design/web-design-specification.html#web-%E5%AD%97%E4%BD%93%E8%A6%81%E6%B1%82) 进行代码书写、多平台字体适配与文档构建。

---

## 🔤 多平台 Web 字体适配规范 (vxhly Specification)

为确保系统在 **iOS / macOS、Android、Windows 及 Linux** 多终端设备与不同分辩率下均能获得最高清晰度（锐利抗锯齿）与一致的视觉呈现，全局 `font-family` 严格按照以下优先级降级链配置：

```css
font-family:
  /* 1. iOS / macOS (Apple 官方英文字体与 SF Pro) */
  "SF Pro Display", "SF Pro Text", "SF UI Text",
  -apple-system, BlinkMacSystemFont,

  /* 2. Android & Windows 英文字体 */
  "Segoe UI", Roboto, "Helvetica Neue", Arial,

  /* 3. Mac & iOS 中文字体 (苹方 简/繁 & 冬青黑体) */
  "PingFang SC", "PingFang TC", "Hiragino Sans GB",

  /* 4. Windows 中文字体 (微软雅黑 & 微軟正黑體) */
  "Microsoft YaHei", "Microsoft JhengHei",

  /* 5. Android 中文字体 (思源黑体 & Droid Sans) */
  "Source Han Sans CN", "Noto Sans CJK SC", "Droid Sans Fallback",

  /* 6. 通用兜底 */
  sans-serif;
```

### 渲染与排版细节：
- **字体平滑度**：开启 `-webkit-font-smoothing: antialiased;` 与 `-moz-osx-font-smoothing: grayscale;`。
- **文本渲染**：配置 `text-rendering: optimizeLegibility;` 与数字 `font-feature-settings: "cv02", "cv03", "cv04", "cv11";`。
- **字号与行距**：使用 `16px` 视口基准值与 `1.6` 黄金倍率行距。

---

## 核心编码规范摘要 (Code Principles)

### 1. 🔤 命名规范 (Naming Conventions)

| 类型 | 规范范式 | 示例 | 说明 |
| :--- | :--- | :--- | :--- |
| **React 组件 / 类** | `PascalCase` | `AssetList.jsx`, `CustomSelect` | 大驼峰命名，扩展名为 `.jsx` |
| **函数与变量** | `camelCase` | `handleSaveAsset()`, `selectedCategory` | 小驼峰命名，动词前缀 |
| **全局常量** | `UPPER_SNAKE_CASE` | `INITIAL_LOCATIONS`, `JWT_SECRET` | 大写蛇形命名 |
| **数据库字段 / JSON** | `snake_case` | `purchase_price`, `location_id` | 小写下划线分割 |
| **配置文件 / 工具** | `kebab-case` / `camelCase` | `mockDataService.js`, `vite.config.js` | 保持全小写短横线或小驼峰 |

---

### 2. 📦 导入依赖排序 (Import Grouping & Order)

每个代码文件顶部的 `import` 语句须按照以下顺序层级分组，组与组之间保留空行：

```javascript
// 1. 第三方核心库 (React, Lucide, Recharts 等)
import React, { useState, useEffect } from 'react';
import { Box, Plus, Search } from 'lucide-react';

// 2. 内部上下文与服务层 (Context, Services, API)
import { useAssets } from '../context/AssetContext';
import { ApiService } from '../services/apiService';

// 3. UI 组件与子模组 (Components)
import CustomSelect from './CustomSelect';
```

---

### 3. 💬 JSDoc 注释与结构化说明 (Documentation & Comments)

所有的公共服务方法、复杂的计算派生与核心 API 路由均须标注清晰的 JSDoc 注释：

```javascript
/**
 * 计算资产的动态折旧估值
 * @param {Object} asset - 资产实体数据对象
 * @returns {number} 实时计算后的评估残值 (¥)
 */
static calculateLiveValue(asset) {
  // ...
}
```

---

### 4. 🛡️ 容错性与空值安全 (Null Safety & Defensive Programming)

- 避免直接取未校验的属性：使用可选链 `?.` 或默认空数组 `options || []` 防范 `TypeError`。
- 全局使用 `ErrorBoundary` 组件包裹根节点，捕获渲染异常并提供友好恢复入口。
- API 接口统一捕获 `try ... catch` 并返回标准的错误 JSON 数据包。
