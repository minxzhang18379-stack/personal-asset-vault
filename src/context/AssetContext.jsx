import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/apiService';
import { hashPassword, verifyPasswordHash, DEFAULT_ADMIN_HASH, DEFAULT_RECOVERY_KEY_HASH } from '../utils/securityCrypto';
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
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  // 安全恢复密钥哈希散列摘要存储 (无明文 Key)
  const [masterRecoveryKeyHash] = useState(() => {
    localStorage.removeItem('ASSET_VAULT_RECOVERY_KEY'); // 彻底抹除浏览器明文残留
    return localStorage.getItem('ASSET_VAULT_RECOVERY_KEY_HASH') || DEFAULT_RECOVERY_KEY_HASH;
  });

  // 应急强制重置密码方法 (基于 Web Crypto SHA-256 恢复密钥散列校验)
  const handleForceResetPassword = async (accountInput, inputRecoveryKey, newPassword) => {
    if (!accountInput || !accountInput.trim()) {
      throw new Error('请输入要重置的账号或关联邮箱');
    }

    // SHA-256 散列校验输入的恢复密钥 (F12 与抓包零明文)
    const isKeyValid = await verifyPasswordHash(inputRecoveryKey?.trim(), masterRecoveryKeyHash);
    if (!isKeyValid) {
      logAction('SECURITY_ALERT', '尝试重置密码失败：安全恢复密钥校验错误', 'FAILED');
      throw new Error('安全恢复密钥校验错误，无法执行重置');
    }
    if (!newPassword || newPassword.length < 4) {
      throw new Error('新密码不能少于 4 位字符');
    }

    const inputStr = accountInput.trim().toLowerCase();
    let targetUser = userAccounts.find(acc => 
      (acc.username && acc.username.toLowerCase() === inputStr) ||
      (acc.name && acc.name.toLowerCase() === inputStr) ||
      (acc.email && acc.email.toLowerCase() === inputStr)
    );

    const newHash = await hashPassword(newPassword);

    if (targetUser) {
      const updatedUser = { ...targetUser, passwordHash: newHash };
      const updatedAccounts = userAccounts.map(acc => acc.id === targetUser.id ? updatedUser : acc);
      saveAccountsList(updatedAccounts);
      if (currentUser?.id === targetUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(updatedUser));
      }
      logAction('SECURITY_AUTH', `使用应急恢复密钥强制重置了账户【${targetUser.name} <${targetUser.email}>】的专属密码`, 'WARNING');
    } else {
      // 账户不存在时强制为其注册开通
      const isEmail = inputStr.includes('@');
      const newAccName = isEmail ? inputStr.split('@')[0] : accountInput.trim();
      const newAccEmail = isEmail ? inputStr : `${inputStr.replace(/\s+/g, '')}@gmail.com`;
      const newAcc = {
        id: `usr-${Date.now()}`,
        name: newAccName,
        username: newAccName.toLowerCase(),
        email: newAccEmail,
        role: 'master',
        roleName: '超级管理员',
        passwordHash: newHash
      };
      saveAccountsList([...userAccounts, newAcc]);
      logAction('SECURITY_AUTH', `使用应急恢复密钥强制创建并重置了新账户【${newAcc.name}】的密码`, 'WARNING');
    }
    return true;
  };

  // 180 天合规日志 State
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());

  const refreshAuditLogs = () => {
    setAuditLogs(getAuditLogs());
  };

  const logAction = (eventType, details, status = 'SUCCESS') => {
    createLogEvent(eventType, details, status, `${currentUser?.name || 'Minx Zhang'} (${currentUser?.roleName || '主超级管理员'})`);
    refreshAuditLogs();
  };

  // 多用户独立账号与独立密码存储表 (每个账号拥有独一无二的专属 SHA-256 哈希散列密码)
  const [userAccounts, setUserAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('ASSET_VAULT_USER_ACCOUNTS_V3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'usr-1',
        name: 'Minx Zhang',
        username: 'minxzhang',
        email: 'minxzhang18379@gmail.com',
        role: 'master',
        roleName: '主超级管理员',
        passwordHash: DEFAULT_ADMIN_HASH // 当前用户的专属密码散列
      },
      {
        id: 'usr-2',
        name: 'Family Member',
        username: 'family',
        email: 'family@assetvault.com',
        role: 'family',
        roleName: '家庭共享成员',
        passwordHash: DEFAULT_ADMIN_HASH
      }
    ];
  });

  // 当前登录成员
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ASSET_VAULT_CURRENT_USER');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return {
      id: 'usr-1',
      name: 'Minx Zhang',
      username: 'minxzhang',
      email: 'minxzhang18379@gmail.com',
      role: 'master',
      roleName: '主超级管理员',
      passwordHash: DEFAULT_ADMIN_HASH
    };
  });

  // 保存并更新账号列表到 LocalStorage
  const saveAccountsList = (updatedList) => {
    setUserAccounts(updatedList);
    localStorage.setItem('ASSET_VAULT_USER_ACCOUNTS_V3', JSON.stringify(updatedList));
  };

  // 修改当前登录用户的专属个人密码
  const handleChangePassword = async (oldPass, newPass) => {
    const userPassHash = currentUser?.passwordHash || DEFAULT_ADMIN_HASH;
    const isOldValid = await verifyPasswordHash(oldPass, userPassHash);
    if (!isOldValid) {
      logAction('PASSWORD_CHANGE', `修改账户【${currentUser?.name}】专属密码失败：旧密码校验错误`, 'FAILED');
      throw new Error('原旧密码校验错误，请输入当前账户正确的专属密码');
    }
    if (!newPass || newPass.length < 4) {
      throw new Error('新密码长度不能少于 4 位字符');
    }
    const newHash = await hashPassword(newPass);
    const updatedProfile = { ...currentUser, passwordHash: newHash };
    setCurrentUser(updatedProfile);
    localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(updatedProfile));

    // 同步更新 userAccounts 列表对应用户密码
    const updatedAccounts = userAccounts.map(acc => 
      acc.id === currentUser.id ? updatedProfile : acc
    );
    saveAccountsList(updatedAccounts);

    logAction('PASSWORD_CHANGE', `成功为账户【${currentUser?.name} <${currentUser?.email}>】更新专属安全密码 (SHA-256)`, 'SUCCESS');
    return true;
  };

  // 更新账号资料
  const handleUpdateUser = (updatedProfile) => {
    const newProfile = { ...currentUser, ...updatedProfile };
    setCurrentUser(newProfile);
    localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(newProfile));

    const updatedAccounts = userAccounts.map(acc => 
      acc.id === currentUser.id ? newProfile : acc
    );
    saveAccountsList(updatedAccounts);
  };

  // 新增独立成员账号
  const handleAddUserAccount = async (newAccountData) => {
    const initialHash = await hashPassword(newAccountData.password || '123456');
    const newAcc = {
      id: `usr-${Date.now()}`,
      name: newAccountData.name.trim(),
      username: newAccountData.username?.trim() || newAccountData.name.trim().toLowerCase(),
      email: newAccountData.email.trim(),
      role: newAccountData.role || 'family',
      roleName: newAccountData.role === 'master' ? '主超级管理员' : newAccountData.role === 'family' ? '家庭共享成员' : '只读访客模式',
      passwordHash: initialHash
    };
    const newList = [...userAccounts, newAcc];
    saveAccountsList(newList);
    logAction('SECURITY_AUTH', `金库成功登记开通新成员账号【${newAcc.name} <${newAcc.email}>】角色:${newAcc.roleName}`, 'SUCCESS');
    return newAcc;
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
      totalValuation: totalPurchaseValue,
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation,
      expiringWarranties,
      lowStockConsumables,
      expiringConsumables,
      assetCount: assets ? assets.length : 0,
      consumableCount: consumables ? consumables.length : 0
    };
  }, [assets, consumables]);

  const login = async (usernameOrEmail, password) => {
    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      throw new Error('请输入登录账号或邮箱');
    }
    const inputStr = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    // 在多用户存储表中查找匹配账号或邮箱
    let targetUser = userAccounts.find(acc => 
      (acc.username && acc.username.toLowerCase() === inputStr) ||
      (acc.name && acc.name.toLowerCase() === inputStr) ||
      (acc.email && acc.email.toLowerCase() === inputStr)
    );

    // 如果未预置该账号，自动初始化为专属独立账号
    if (!targetUser) {
      const isEmail = inputStr.includes('@');
      const newAccName = isEmail ? inputStr.split('@')[0] : usernameOrEmail.trim();
      const newAccEmail = isEmail ? inputStr : `${inputStr.replace(/\s+/g, '')}@gmail.com`;
      
      const userHash = await hashPassword(cleanPassword);
      targetUser = {
        id: `usr-${Date.now()}`,
        name: newAccName,
        username: newAccName.toLowerCase(),
        email: newAccEmail,
        role: 'master',
        roleName: '主超级管理员',
        passwordHash: userHash
      };
      const updatedList = [...userAccounts, targetUser];
      setUserAccounts(updatedList);
      localStorage.setItem('ASSET_VAULT_USER_ACCOUNTS_V3', JSON.stringify(updatedList));
    }

    // 校验该特定账户专属的独立 SHA-256 密码哈希摘要
    const userPassHash = targetUser.passwordHash || DEFAULT_ADMIN_HASH;
    let isValid = await verifyPasswordHash(cleanPassword, userPassHash);
    if (!isValid && password !== cleanPassword) {
      // 容错备选原始未 trim 密码
      isValid = await verifyPasswordHash(password, userPassHash);
    }

    if (isValid) {
      setCurrentUser(targetUser);
      localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(targetUser));
      setIsAuthenticated(true);
      localStorage.setItem('ASSET_VAULT_AUTH', 'true');
      logAction('AUTH_LOGIN', `独立账户【${targetUser.name} <${targetUser.email}>】校验专属独立密码成功，解锁进入金库`, 'SUCCESS');
      return true;
    }

    logAction('AUTH_LOGIN', `解密失败：账户【${targetUser.name} <${targetUser.email}>】专属独立密码校验错误`, 'FAILED');
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
    userAccounts,
    handleAddUserAccount,
    handleChangePassword,
    handleForceResetPassword,
    currentUser,
    handleUpdateUser,
    auditLogs,
    refreshAuditLogs
  }), [assets, consumables, allItems, locations, categories, loading, stats, userAccounts, currentUser, auditLogs]);

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
    isRecoveryOpen,
    setIsRecoveryOpen,
    isAuthenticated,
    login,
    logout
  }), [
    activeTab, searchQuery, selectedCategory, selectedLocationId, theme,
    detailAsset, editingAsset, editingConsumable, isSettingsOpen, isSecurityModalOpen, isAuditLogOpen, isRecoveryOpen, isAuthenticated
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
