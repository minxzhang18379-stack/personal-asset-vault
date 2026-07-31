// 预置初始示范数据，统一实物架构，包含耐用财产与快消耗材
const INITIAL_LOCATIONS = [
  { id: 'loc-1', name: '主卧室柜屉', parent_id: null, icon: 'Bed', description: '包含主卧衣柜、床头柜与密码箱' },
  { id: 'loc-2', name: '书房 / 办公区', parent_id: null, icon: 'BookOpen', description: '升降桌、书柜及数码抽屉' },
  { id: 'loc-3', name: '客厅与玄关', parent_id: null, icon: 'Tv', description: '电视柜、进门钥匙盘与鞋柜' },
  { id: 'loc-4', name: '地下车库 / 私家车', parent_id: null, icon: 'Car', description: '主驾车内与车库独立储物架' },
  { id: 'loc-5', name: '保险箱 / 密匣', parent_id: null, icon: 'ShieldCheck', description: '重要权属文件、金银珠宝与大额票据' },
];

const INITIAL_ASSETS = [
  {
    id: 'ast-101',
    name: 'Tesla Model Y 纯电动 SUV',
    category: '交通工具',
    item_type: 'durable',
    status: 'in_use',
    purchase_price: 263900,
    current_value: 198000,
    depreciation_rate: 0.12,
    purchase_date: '2023-05-15',
    warranty_expire_date: '2027-05-15',
    location_id: 'loc-4',
    brand: 'Tesla',
    model_number: 'Model Y 长续航',
    serial_number: 'VIN-98213849182390',
    notes: '已购买延长质保，车漆贴了隐形车衣，每年 5 月续保车险。',
    attachments: [
      { id: 'att-1', type: 'photo', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80', title: '车辆外观照' },
      { id: 'att-2', type: 'invoice', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', title: '购车发票与完税证明' }
    ]
  },
  {
    id: 'ast-102',
    name: 'iPhone 15 Pro Max (512GB 钛金属)',
    category: '电子产品',
    item_type: 'durable',
    status: 'in_use',
    purchase_price: 9999,
    current_value: 6800,
    depreciation_rate: 0.20,
    purchase_date: '2023-10-01',
    warranty_expire_date: '2025-10-01',
    location_id: 'loc-2',
    brand: 'Apple',
    model_number: 'A3106',
    serial_number: 'FK39X812903',
    notes: '购买了 AppleCare+ 全球联保服务，随时可无忧换电池。',
    attachments: [
      { id: 'att-3', type: 'photo', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', title: '手机外观' }
    ]
  },
  {
    id: 'ast-103',
    name: 'MacBook Pro 16" M3 Max (64G/2T)',
    category: '电子产品',
    item_type: 'durable',
    status: 'in_use',
    purchase_price: 27999,
    current_value: 22500,
    depreciation_rate: 0.15,
    purchase_date: '2024-01-10',
    warranty_expire_date: '2027-01-10',
    location_id: 'loc-2',
    brand: 'Apple',
    model_number: 'A2991',
    serial_number: 'C02GX910831',
    notes: '生产力核心主力机，定检散热无异常。',
    attachments: [
      { id: 'att-4', type: 'photo', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', title: '工作台照片' }
    ]
  },
  {
    id: 'ast-104',
    name: '欧米茄 (Omega) 超霸系列机械腕表',
    category: '珠宝首饰',
    item_type: 'durable',
    status: 'in_use',
    purchase_price: 52000,
    current_value: 48000,
    depreciation_rate: 0.03,
    purchase_date: '2022-08-18',
    warranty_expire_date: '2027-08-18',
    location_id: 'loc-5',
    brand: 'Omega',
    model_number: '310.30.42.50.01.001',
    serial_number: 'OM-8871923',
    notes: '登月款手动上链，全套保卡保盒齐全，收纳于保险箱摇表器。',
    attachments: [
      { id: 'att-5', type: 'photo', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80', title: '腕表实物照' }
    ]
  },
  {
    id: 'ast-105',
    name: 'Arc\'teryx 始祖鸟 Alpha SV 顶配硬壳外套',
    category: '服饰鞋包',
    item_type: 'durable',
    status: 'in_use',
    purchase_price: 8200,
    current_value: 6500,
    depreciation_rate: 0.08,
    purchase_date: '2023-11-20',
    warranty_expire_date: '2099-12-31',
    location_id: 'loc-1',
    brand: 'Arc\'teryx',
    model_number: 'Alpha SV GORE-TEX PRO',
    serial_number: 'ARC-2023-BLACK',
    notes: '户外冲锋衣，黑金色，主卧悬挂保存。',
    attachments: [
      { id: 'att-6', type: 'photo', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80', title: '服装照片' }
    ]
  },
  // 快消耗材类目 (统一归入 items 数据源)
  {
    id: 'con-1',
    name: 'Nespresso 咖啡胶囊 (黑咖啡混合装)',
    category: '食品饮料',
    item_type: 'consumable',
    quantity: 45,
    unit: '粒',
    min_quantity_alert: 20,
    expiration_date: '2025-09-01',
    location_id: 'loc-3',
    price_per_unit: 4.5,
    notes: '每天消耗约 2 粒，库存低于 20 粒自动预警。'
  },
  {
    id: 'con-2',
    name: 'SK-II 神仙水护肤精华 (330ml)',
    category: '护肤彩妆',
    item_type: 'consumable',
    quantity: 1,
    unit: '瓶',
    min_quantity_alert: 1,
    expiration_date: '2026-11-15',
    location_id: 'loc-1',
    price_per_unit: 1680,
    notes: '主卧化妆台，未开封备用瓶。'
  },
  {
    id: 'con-3',
    name: 'Dyson 戴森 Airblade 滤网替芯',
    category: '居家清洁',
    item_type: 'consumable',
    quantity: 2,
    unit: '组',
    min_quantity_alert: 1,
    expiration_date: '2029-01-01',
    location_id: 'loc-3',
    price_per_unit: 290,
    notes: '空气净化器备用滤网。'
  }
];

const LOCAL_STORAGE_KEY = 'PERSONAL_ASSET_VAULT_DATA_V2';

export class LocalMockService {
  static loadData() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 兼容处理：确保全量 items 聚合
        const allItems = parsed.assets || [];
        if (parsed.consumables && parsed.consumables.length > 0) {
          parsed.consumables.forEach(c => {
            if (!allItems.some(a => a.id === c.id)) {
              allItems.push({ ...c, item_type: 'consumable' });
            }
          });
        }
        return {
          assets: allItems,
          locations: parsed.locations || INITIAL_LOCATIONS
        };
      }
    } catch (e) {
      console.warn('读取本地数据失败，改用初始演示数据', e);
    }
    const defaultData = {
      assets: INITIAL_ASSETS,
      locations: INITIAL_LOCATIONS
    };
    LocalMockService.saveData(defaultData);
    return defaultData;
  }

  static saveData(data) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('写入本地存储失败', e);
    }
  }

  // 计算资产动态估值与折旧 (按照年化折旧系数算法)
  static calculateLiveValue(asset) {
    if (!asset.purchase_date || !asset.purchase_price) {
      return asset.current_value || asset.purchase_price || 0;
    }
    const pDate = new Date(asset.purchase_date);
    const now = new Date();
    const diffYears = Math.max(0, (now - pDate) / (1000 * 60 * 60 * 24 * 365.25));
    const rate = asset.depreciation_rate || 0.1;
    const computed = asset.purchase_price * Math.pow(1 - rate, diffYears);
    const scrapFloor = asset.purchase_price * 0.1;
    return Math.max(Math.round(computed), Math.round(scrapFloor));
  }
}
