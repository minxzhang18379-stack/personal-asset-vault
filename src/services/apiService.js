/**
 * Personal Asset Vault - API Service Layer
 * @module services/apiService
 * @see {@link https://github.com/lyrasoft/coding-standards} Lyrasoft Coding Standards
 */

import { LocalMockService } from './mockDataService';

const USE_CLOUDFLARE_WORKER = false;
const WORKER_BASE_URL = '/api';

/**
 * 统一 API 客户端服务对象
 */
export const ApiService = {
  /**
   * 获取全量仪表盘与资产数据
   * @returns {Promise<Object>} 仪表盘元数据 (assets, consumables, allItems, locations)
   */
  async getDashboardData() {
    if (USE_CLOUDFLARE_WORKER) {
      try {
        const res = await fetch(`${WORKER_BASE_URL}/dashboard`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('连接 Cloudflare Worker 失败，降级至本地离线存储:', e);
      }
    }
    const data = LocalMockService.loadData();
    const allItems = data.assets || [];
    const durables = allItems.filter(a => a.item_type !== 'consumable');
    const consumables = allItems.filter(a => a.item_type === 'consumable');

    return {
      assets: durables,
      consumables: consumables,
      allItems: allItems,
      locations: data.locations || []
    };
  },

  /**
   * 统一保存/更新资产记录
   * @param {Object} asset - 待保存的资产数据实体
   * @returns {Promise<Object>} 保存后的资产实体
   */
  async saveAsset(asset) {
    const data = LocalMockService.loadData();
    const existingIndex = data.assets.findIndex(a => a.id === asset.id);

    asset.item_type = asset.item_type || 'durable';
    if (asset.item_type === 'durable') {
      asset.current_value = LocalMockService.calculateLiveValue(asset);
    }
    asset.updated_at = new Date().toISOString();

    if (existingIndex >= 0) {
      data.assets[existingIndex] = { ...data.assets[existingIndex], ...asset };
    } else {
      asset.id = asset.id || 'ast-' + Date.now();
      asset.created_at = new Date().toISOString();
      asset.attachments = asset.attachments || [];
      data.assets.unshift(asset);
    }
    LocalMockService.saveData(data);
    return asset;
  },

  /**
   * 根据 ID 删除资产
   * @param {string} id - 资产记录 ID
   * @returns {Promise<boolean>}
   */
  async deleteAsset(id) {
    const data = LocalMockService.loadData();
    data.assets = data.assets.filter(a => a.id !== id);
    LocalMockService.saveData(data);
    return true;
  },

  /**
   * 保存快消耗材记录
   * @param {Object} item - 耗材实体
   */
  async saveConsumable(item) {
    item.item_type = 'consumable';
    return this.saveAsset(item);
  },

  /**
   * 增减快消耗材的剩余数量
   * @param {string} id - 耗材 ID
   * @param {number} delta - 数量增减量 (如 +1 或 -1)
   */
  async updateConsumableQuantity(id, delta) {
    const data = LocalMockService.loadData();
    const item = data.assets.find(c => c.id === id);
    if (item) {
      item.quantity = Math.max(0, (item.quantity || 0) + delta);
      LocalMockService.saveData(data);
    }
    return item;
  },

  /**
   * 删除耗材记录
   * @param {string} id - 耗材 ID
   */
  async deleteConsumable(id) {
    return this.deleteAsset(id);
  },

  /**
   * 保存/新增收纳位置
   * @param {Object} loc - 位置数据
   */
  async saveLocation(loc) {
    const data = LocalMockService.loadData();
    const existingIndex = data.locations.findIndex(l => l.id === loc.id);
    if (existingIndex >= 0) {
      data.locations[existingIndex] = { ...data.locations[existingIndex], ...loc };
    } else {
      loc.id = loc.id || 'loc-' + Date.now();
      data.locations.push(loc);
    }
    LocalMockService.saveData(data);
    return loc;
  },

  /**
   * 重置系统为初始演示数据
   */
  async resetToDemoData() {
    localStorage.removeItem('PERSONAL_ASSET_VAULT_DATA_V2');
    return this.getDashboardData();
  },

  /**
   * 一键彻底清空全量数据 (清空资产、耗材与存放位置)
   */
  async clearAllData() {
    const emptyData = {
      assets: [],
      locations: []
    };
    LocalMockService.saveData(emptyData);
    return {
      assets: [],
      consumables: [],
      allItems: [],
      locations: []
    };
  }
};
