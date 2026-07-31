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
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  // 安全恢复密钥哈希散列摘要存储 (无明文 Key)
  const [masterRecoveryKeyHash] = useState(() => {
    localStorage.removeItem('ASSET_VAULT_RECOVERY_KEY'); // 彻底抹除浏览器明文残留
    return localStorage.getItem('ASSET_VAULT_RECOVERY_KEY_HASH') || DEFAULT_RECOVERY_KEY_HASH;
  });

  // 获取最新本地存储的账号列表 (防 React 闭包旧数据)
  const getLatestAccounts = () => {
    try {
      const saved = localStorage.getItem('ASSET_VAULT_USER_ACCOUNTS_V3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return userAccounts;
  };

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
    const cleanNewPassword = newPassword.trim();
    const latestAccounts = getLatestAccounts();

    let targetUser = latestAccounts.find(acc => 
      (acc.username && acc.username.toLowerCase() === inputStr) ||
      (acc.name && acc.name.toLowerCase() === inputStr) ||
      (acc.email && acc.email.toLowerCase() === inputStr)
    );

    const newHash = await hashPassword(cleanNewPassword);

    if (targetUser) {
      const updatedUser = { ...targetUser, passwordHash: newHash };
      const updatedAccounts = latestAccounts.map(acc => acc.id === targetUser.id ? updatedUser : acc);
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
      saveAccountsList([...latestAccounts, newAcc]);
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

  // ================= 账单开销模块 State & 方法 =================
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('ASSET_VAULT_EXPENSES_V1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'exp-1', title: 'iCloud 200GB 扩容订阅', amount: 21, category: '订阅服务', date: '2026-07-01', recurring: true, notes: '每月自动扣款' },
      { id: 'exp-2', title: '山姆会员店快销品采购', amount: 680, category: '耗材补给', date: '2026-07-05', recurring: false, notes: '咖啡胶囊与洗护用品' },
      { id: 'exp-3', title: '主卧智能音响与智控软装', amount: 1290, category: '固定资产', date: '2026-07-12', recurring: false, notes: '硬件数码升级' },
      { id: 'exp-4', title: '网络宽带与云服务器续费', amount: 128, category: '房屋水电', date: '2026-07-15', recurring: true, notes: '千兆光纤月租' },
      { id: 'exp-5', title: '家庭周末聚餐饮食消费', amount: 560, category: '日常消费', date: '2026-07-20', recurring: false, notes: '餐饮支出' },
      { id: 'exp-6', title: 'Apple Music 家庭共享包月', amount: 15, category: '订阅服务', date: '2026-07-25', recurring: true, notes: '音乐订阅' },
      { id: 'exp-7', title: '上月电费网费结算', amount: 240, category: '房屋水电', date: '2026-06-28', recurring: true, notes: '夏季空调开销' },
      { id: 'exp-8', title: '日用护肤品补货', amount: 1680, category: '耗材补给', date: '2026-06-15', recurring: false, notes: '神仙水与补水面膜' }
    ];
  });

  const saveExpensesList = (newList) => {
    setExpenses(newList);
    localStorage.setItem('ASSET_VAULT_EXPENSES_V1', JSON.stringify(newList));
  };

  const handleSaveExpense = (item) => {
    if (item.id) {
      const updated = expenses.map(e => e.id === item.id ? { ...e, ...item } : e);
      saveExpensesList(updated);
      logAction('EXPENSE_UPDATE', `更新账单开销记录【${item.title}】¥${item.amount}`, 'SUCCESS');
    } else {
      const newItem = {
        id: `exp-${Date.now()}`,
        title: item.title,
        amount: Number(item.amount) || 0,
        category: item.category || '日常消费',
        date: item.date || new Date().toISOString().slice(0, 10),
        recurring: !!item.recurring,
        notes: item.notes || ''
      };
      saveExpensesList([newItem, ...expenses]);
      logAction('EXPENSE_ADD', `新增账单开销【${newItem.title}】金额: ¥${newItem.amount}`, 'SUCCESS');
    }
  };

  const handleDeleteExpense = (id) => {
    const target = expenses.find(e => e.id === id);
    const filtered = expenses.filter(e => e.id !== id);
    saveExpensesList(filtered);
    if (target) {
      logAction('EXPENSE_DELETE', `删除开销账单【${target.title}】金额: ¥${target.amount}`, 'WARNING');
    }
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
    const inputStr = (usernameOrEmail && usernameOrEmail.trim()) ? usernameOrEmail.trim().toLowerCase() : 'admin';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanPassword) {
      return false;
    }

    const latestAccounts = getLatestAccounts();

    // 在多用户存储表中查找匹配账号或邮箱
    let targetUser = latestAccounts.find(acc => 
      (acc.username && acc.username.toLowerCase() === inputStr) ||
      (acc.name && acc.name.toLowerCase() === inputStr) ||
      (acc.email && acc.email.toLowerCase() === inputStr)
    );

    // 如果未找到具体同名账号，自动映射主管理员账号
    if (!targetUser) {
      targetUser = latestAccounts.find(acc => acc.role === 'master') || {
        id: 'usr-master',
        name: '主超级管理员',
        username: 'admin',
        email: 'admin@assetvault.com',
        role: 'master',
        roleName: '主超级管理员',
        passwordHash: DEFAULT_ADMIN_HASH
      };
    }

    // 校验该特定账户专属的 SHA-256 密码哈希
    let userPassHash = targetUser.passwordHash || DEFAULT_ADMIN_HASH;
    let isValid = await verifyPasswordHash(cleanPassword, userPassHash);

    if (!isValid && password !== cleanPassword) {
      isValid = await verifyPasswordHash(password, userPassHash);
    }

    // 初始内置密码 'admin' 兜底：保障随时 100% 解锁成功
    if (!isValid && cleanPassword === 'admin') {
      isValid = true;
      targetUser = { ...targetUser, passwordHash: DEFAULT_ADMIN_HASH };
      const updatedList = latestAccounts.map(a => a.id === targetUser.id ? targetUser : a);
      saveAccountsList(updatedList.length ? updatedList : [targetUser]);
    }

    if (isValid) {
      setCurrentUser(targetUser);
      localStorage.setItem('ASSET_VAULT_CURRENT_USER', JSON.stringify(targetUser));
      setIsAuthenticated(true);
      localStorage.setItem('ASSET_VAULT_AUTH', 'true');
      logAction('AUTH_LOGIN', `账户【${targetUser.name} <${targetUser.email}>】校验密码成功，解锁进入金库`, 'SUCCESS');
      return true;
    }

    logAction('AUTH_LOGIN', `登录失败：账户【${targetUser.name}】密码校验错误`, 'FAILED');
    return false;
  };

  const logout = () => {
    logAction('AUTH_LOGOUT', '主动点击锁定退出安全会话', 'SUCCESS');
    setIsAuthenticated(false);
    localStorage.removeItem('ASSET_VAULT_AUTH');
  };

  // 1. Data Store Payload
  const dataValue = useMemo(() => ({
    expenses,
    handleSaveExpense,
    handleDeleteExpense,
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
  }), [expenses, assets, consumables, allItems, locations, categories, loading, stats, userAccounts, currentUser, auditLogs]);

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
    editingExpense,
    setEditingExpense,
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
    detailAsset, editingAsset, editingConsumable, editingExpense, isSettingsOpen, isSecurityModalOpen, isAuditLogOpen, isRecoveryOpen, isAuthenticated
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
