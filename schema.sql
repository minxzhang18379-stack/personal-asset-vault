-- 个人资产与财产管理系统 Cloudflare D1 数据库初始化 Schema (统一 实体 架构 V2)

-- 1. 存储位置表 (收纳点，如主卧衣柜、车库、保险柜)
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  icon TEXT DEFAULT 'Package',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 统一物品/资产表 (同时支持耐用财产与快消耗材)
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 电子产品, 交通工具, 珠宝首饰, 服饰鞋包, 房产不动产, 食品饮料, 护肤彩妆, 日用品等
  item_type TEXT DEFAULT 'durable', -- durable(耐用资产), consumable(快消耗材)
  status TEXT DEFAULT 'in_use', -- in_use(在用/充盈), idle(闲置), repair(维修), sold(已转售), low_stock(低库存)
  
  -- 耐用资产属性
  purchase_price REAL DEFAULT 0, -- 购买原价
  current_value REAL DEFAULT 0, -- 当前估计价值
  depreciation_rate REAL DEFAULT 0.1, -- 年折旧率
  purchase_date DATE, -- 购买日期
  warranty_expire_date DATE, -- 保修截止日期
  brand TEXT,
  model_number TEXT,
  serial_number TEXT,

  -- 耗材/快消品属性
  quantity INTEGER DEFAULT 1, -- 剩余数量
  unit TEXT DEFAULT '件', -- 计量单位 (粒/瓶/盒/件)
  min_quantity_alert INTEGER DEFAULT 1, -- 低库存预警界限
  expiration_date DATE, -- 保质期到期日
  price_per_unit REAL DEFAULT 0, -- 耗材单价

  location_id TEXT, -- 存放位置
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 3. 资产图片与凭证表 (支持 R2 / Web URL)
CREATE TABLE IF NOT EXISTS asset_attachments (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  type TEXT DEFAULT 'photo', -- photo(实物照片), invoice(发票凭证), warranty(保修卡)
  url TEXT NOT NULL,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 4. 账号密码安全表 (支持多终端全量账号同步)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'master',
  role_name TEXT DEFAULT '主超级管理员',
  password_hash TEXT NOT NULL,
  is_default_password INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 开销账单管理表
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  category TEXT DEFAULT '日常消费',
  date DATE,
  recurring INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 插入默认数据
INSERT OR IGNORE INTO locations (id, name, icon, description) VALUES
('loc-1', '主卧室柜屉', 'Bed', '主卧空间与衣柜柜屉'),
('loc-2', '客房 / 书房', 'BookOpen', '书房电脑桌与书柜'),
('loc-3', '客厅与玄关', 'Tv', '客厅电视柜与玄关收纳柜'),
('loc-4', '地下车库 / 私家车', 'Car', '私人车辆与车库杂物架'),
('loc-5', '保险箱 / 密匣', 'ShieldCheck', '存放重要权属文件、金银珠宝与大额票据');

INSERT OR IGNORE INTO users (id, name, username, email, role, role_name, password_hash, is_default_password) VALUES
('usr-1', 'Minx Zhang', 'minxzhang', 'minxzhang18379@gmail.com', 'master', '主超级管理员', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1),
('usr-2', 'Family Member', 'family', 'family@assetvault.com', 'family', '家庭共享成员', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1);

INSERT OR IGNORE INTO expenses (id, title, amount, category, date, recurring, notes) VALUES
('exp-1', 'iCloud 200GB 扩容订阅', 21, '订阅服务', '2026-07-01', 1, '每月自动扣款'),
('exp-2', '山姆会员店快销品采购', 680, '耗材补给', '2026-07-05', 0, '咖啡胶囊与洗护用品'),
('exp-3', '主卧智能音响与智控软装', 1290, '固定资产', '2026-07-12', 0, '硬件数码升级'),
('exp-4', '网络宽带与云服务器续费', 128, '房屋水电', '2026-07-15', 1, '千兆光纤月租');
