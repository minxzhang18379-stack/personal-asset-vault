import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/apiService';

// 解耦为 2 个独立 Context：一个存核心数据与 CRUD，另一个存 UI 交互与视图状态
const AssetDataContext = createContext(null);
const UIStateContext = createContext(null);

export function AssetProvider({ children }) {
  // 1. 核心领域数据状态 (统一实体架构)
  const [assets, setAssets] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 资产大类定义 (支持动态自定义)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('ASSET_VAULT_CATEGORIES');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['电子产品', '交通工具', '珠宝首饰', '服饰鞋包', '房产不动产', '其它'];
  });

  const handleAddCategory = (newCat) => {
    if (!newCat || categories.includes(newCat)) return;
    const updated = [...categories, newCat];
    setCategories(updated);
    try {
      localStorage.setItem('ASSET_VAULT_CATEGORIES', JSON.stringify(updated));
    } catch (e) {}
  };

  // 2. 局部 UI 交互状态
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocationId, setSelectedLocationId] = useState('ALL');
  const [theme, setTheme] = useState('dark');

  // 弹窗与控制
  const [detailAsset, setDetailAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingConsumable, setEditingConsumable] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 鉴权保护
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ASSET_VAULT_AUTH') === 'true';
  });

  // 刷新全量数据
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDashboardData();
      setAssets(data.assets || []);
      setConsumables(data.consumables || []);
      setAllItems(data.allItems || [...(data.assets || []), ...(data.consumables || [])]);
      setLocations(data.locations || []);
    } catch (e) {
      console.error('加载资产数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 资产/耗材/位置 API 操作
  const handleSaveAsset = async (assetData) => {
    await ApiService.saveAsset(assetData);
    await refreshData();
    setEditingAsset(null);
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('确定要彻底删除该资产记录吗？此操作无法撤销。')) {
      await ApiService.deleteAsset(id);
      if (detailAsset && detailAsset.id === id) setDetailAsset(null);
      await refreshData();
    }
  };

  const handleSaveConsumable = async (itemData) => {
    await ApiService.saveConsumable(itemData);
    await refreshData();
    setEditingConsumable(null);
  };

  const handleUpdateConsumableQty = async (id, delta) => {
    await ApiService.updateConsumableQuantity(id, delta);
    await refreshData();
  };

  const handleDeleteConsumable = async (id) => {
    if (window.confirm('确定要删除该耗材记录吗？')) {
      await ApiService.deleteConsumable(id);
      await refreshData();
    }
  };

  const handleSaveLocation = async (locData) => {
    await ApiService.saveLocation(locData);
    await refreshData();
  };

  const handleResetData = async () => {
    if (window.confirm('确定要重置为默认演示数据吗？自定义数据将被覆盖。')) {
      await ApiService.resetToDemoData();
      await refreshData();
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('⚠️ 危险警告：确定要一键彻底清空所有资产、快消耗材与收纳位置记录吗？此操作无法撤销！')) {
      await ApiService.clearAllData();
      await refreshData();
    }
  };

  // 派生财务与预警计算逻辑 (通过 useMemo 隔离重计算)
  const stats = useMemo(() => {
    const totalPurchaseValue = assets.reduce((sum, a) => sum + (Number(a.purchase_price) || 0), 0);
    const totalCurrentValue = assets.reduce((sum, a) => sum + (Number(a.current_value) || 0), 0);
    const totalDepreciation = Math.max(0, totalPurchaseValue - totalCurrentValue);

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWarranties = assets.filter(a => {
      if (!a.warranty_expire_date) return false;
      const expire = new Date(a.warranty_expire_date);
      return expire >= now && expire <= thirtyDaysLater;
    });

    const lowStockConsumables = consumables.filter(c => c.quantity <= (c.min_quantity_alert || 1));
    const expiringConsumables = consumables.filter(c => {
      if (!c.expiration_date) return false;
      const exp = new Date(c.expiration_date);
      return exp <= thirtyDaysLater;
    });

    return {
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation,
      expiringWarranties,
      lowStockConsumables,
      expiringConsumables,
      assetCount: assets.length,
      consumableCount: consumables.length
    };
  }, [assets, consumables]);

  const login = (password) => {
    if (password === 'admin' || password === '123456' || password.length > 0) {
      setIsAuthenticated(true);
      localStorage.setItem('ASSET_VAULT_AUTH', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ASSET_VAULT_AUTH');
  };

  // 1. Data Store Payload
  const dataValue = useMemo(() => ({
    assets,
    consumables,
    allItems,
    locations,
    categories,
    loading,
    stats,
    handleAddCategory,
    handleSaveAsset,
    handleDeleteAsset,
    handleSaveConsumable,
    handleUpdateConsumableQty,
    handleDeleteConsumable,
    handleSaveLocation,
    handleResetData,
    handleClearAllData,
    refreshData
  }), [assets, consumables, allItems, locations, categories, loading, stats]);

  // 2. UI Store Payload
  const uiValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLocationId,
    setSelectedLocationId,
    theme,
    setTheme,
    detailAsset,
    setDetailAsset,
    editingAsset,
    setEditingAsset,
    editingConsumable,
    setEditingConsumable,
    isSettingsOpen,
    setIsSettingsOpen,
    isAuthenticated,
    login,
    logout
  }), [
    activeTab, searchQuery, selectedCategory, selectedLocationId, theme,
    detailAsset, editingAsset, editingConsumable, isSettingsOpen, isAuthenticated
  ]);

  return (
    <AssetDataContext.Provider value={dataValue}>
      <UIStateContext.Provider value={uiValue}>
        {children}
      </UIStateContext.Provider>
    </AssetDataContext.Provider>
  );
}

// 分离 Hook 派生
export function useAssetData() {
  const context = useContext(AssetDataContext);
  if (!context) throw new Error('useAssetData 必须在 AssetProvider 内使用');
  return context;
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) throw new Error('useUIState 必须在 AssetProvider 内使用');
  return context;
}

// 向上兼容组合 Hook
export function useAssets() {
  const data = useAssetData();
  const ui = useUIState();
  return { ...data, ...ui };
}
