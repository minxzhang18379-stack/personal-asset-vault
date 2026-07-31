import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/apiService';
import { hashPassword, verifyPasswordHash, DEFAULT_ADMIN_HASH } from '../utils/securityCrypto';
import { logEvent as createLogEvent, getAuditLogs } from '../utils/logger';

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
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  // 180 天合规日志 State
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());

  const refreshAuditLogs = () => {
    setAuditLogs(getAuditLogs());
  };

  const logAction = (eventType, details, status = 'SUCCESS') => {
    createLogEvent(eventType, details, status, `${currentUser?.name || 'Minx Zhang'} (${currentUser?.roleName || '主超级管理员'})`);
    refreshAuditLogs();
  };

  // 主访问密码哈希摘要管理 (SHA-256 带盐存储，防 LocalStorage 明文泄露)
  const [masterPasswordHash, setMasterPasswordHash] = useState(() => {
    return localStorage.getItem('ASSET_VAULT_MASTER_PASSWORD_HASH') || DEFAULT_ADMIN_HASH;
  });

  // 当前登录成员与安全角色
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ASSET_VAULT_CURRENT_USER');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return {
      id: 'usr-1',
      name: 'Minx Zhang',
      email: 'minxzhang18379@gmail.com',
      role: 'master',
      roleName: '主超级管理员',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
  });

  const handleChangePassword = async (oldPass, newPass) => {
    const isOldValid = await verifyPasswordHash(oldPass, masterPasswordHash);
    if (!isOldValid) {
      logAction('PASSWORD_CHANGE', '修改主守护密码尝试失败：原旧密码校验错误', 'FAILED');
      throw new Error('原旧密码校验错误，请输入正确的当前密码');
    }
    if (!newPass || newPass.length < 4) {
      throw new Error('新密码长度不能少于 4 位字符');
    }
    const newHash = await hashPassword(newPass);
    setMasterPasswordHash(newHash);
    localStorage.setItem('ASSET_VAULT_MASTER_PASSWORD_HASH', newHash);
    localStorage.removeItem('ASSET_VAULT_MASTER_PASSWORD'); // 清理历史明文
    logAction('PASSWORD_CHANGE', '成功修改金库主守护密码 (更新 SHA-256 哈希摘要)', 'SUCCESS');
    return true;
  };

  const handleUpdateUser = (updatedProfile) => {
    const newProfile = { ...currentUser, ...updatedProfile };
    setCurrentUser(newProfile);
    localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(newProfile));
  };

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
    const isEdit = Boolean(assetData.id);
    await ApiService.saveAsset(assetData);
    logAction('ASSET_CREATE', `${isEdit ? '更新修改' : '登记新增'}耐用资产【${assetData.name}】`, 'SUCCESS');
    await refreshData();
    setEditingAsset(null);
  };

  const handleDeleteAsset = async (id) => {
    const target = assets.find(a => a.id === id);
    if (window.confirm('确定要彻底删除该资产记录吗？此操作无法撤销。')) {
      await ApiService.deleteAsset(id);
      logAction('ASSET_DELETE', `彻底删除资产记录【${target?.name || id}】`, 'WARNING');
      if (detailAsset && detailAsset.id === id) setDetailAsset(null);
      await refreshData();
    }
  };

  const handleSaveConsumable = async (itemData) => {
    await ApiService.saveConsumable(itemData);
    logAction('ASSET_CREATE', `保存快消耗材【${itemData.name}】库存数量 (${itemData.quantity}${itemData.unit})`, 'SUCCESS');
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
      logAction('ASSET_DELETE', `删除耗材记录 ID:${id}`, 'WARNING');
      await refreshData();
    }
  };

  const handleSaveLocation = async (locData) => {
    await ApiService.saveLocation(locData);
    logAction('ASSET_CREATE', `新增收纳空间位置【${locData.name}】`, 'SUCCESS');
    await refreshData();
  };

  const handleResetData = async () => {
    if (window.confirm('确定要重置为默认演示数据吗？自定义数据将被覆盖。')) {
      await ApiService.resetToDemoData();
      logAction('DATA_CLEAR', '重置初始化全库为默认演示数据', 'WARNING');
      await refreshData();
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('⚠️ 危险警告：确定要一键彻底清空所有资产、快消耗材与收纳位置记录吗？此操作无法撤销！')) {
      await ApiService.clearAllData();
      logAction('DATA_CLEAR', '⚠️ 触发危险操作：一键彻底清空全库资产与位置档案', 'WARNING');
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

  const login = async (usernameOrEmail, password) => {
    // 智能解析输入的账号与邮箱关联双向绑定
    if (usernameOrEmail && usernameOrEmail.trim()) {
      const inputStr = usernameOrEmail.trim();
      const isEmailInput = inputStr.includes('@');
      if (isEmailInput) {
        handleUpdateUser({ 
          email: inputStr, 
          name: currentUser?.name || inputStr.split('@')[0] 
        });
      } else {
        handleUpdateUser({ 
          name: inputStr,
          email: currentUser?.email || `${inputStr.toLowerCase().replace(/\s+/g, '')}@gmail.com`
        });
      }
    }

    // 校验密码
    const passToCheck = password !== undefined ? password : usernameOrEmail;
    const isValid = await verifyPasswordHash(passToCheck, masterPasswordHash);
    if (isValid) {
      setIsAuthenticated(true);
      localStorage.setItem('ASSET_VAULT_AUTH', 'true');
      const boundUserStr = `${currentUser?.name || usernameOrEmail} <${currentUser?.email || '已绑定邮箱'}>`;
      logAction('AUTH_LOGIN', `关联账户【${boundUserStr}】成功通过安全校验解锁进入金库`, 'SUCCESS');
      return true;
    }
    logAction('AUTH_LOGIN', `解密失败：账户【${usernameOrEmail || '未知用户'}】密码校验错误`, 'FAILED');
    return false;
  };

  const logout = () => {
    logAction('AUTH_LOGOUT', '主动点击锁定退出安全会话', 'SUCCESS');
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
    refreshData,
    masterPasswordHash,
    handleChangePassword,
    currentUser,
    handleUpdateUser,
    auditLogs,
    refreshAuditLogs
  }), [assets, consumables, allItems, locations, categories, loading, stats, masterPasswordHash, currentUser, auditLogs]);

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
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    isAuditLogOpen,
    setIsAuditLogOpen,
    isAuthenticated,
    login,
    logout
  }), [
    activeTab, searchQuery, selectedCategory, selectedLocationId, theme,
    detailAsset, editingAsset, editingConsumable, isSettingsOpen, isSecurityModalOpen, isAuditLogOpen, isAuthenticated
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
