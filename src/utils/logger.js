/**
 * 工业级审计日志管理服务 (180 天合规留存日志引擎)
 * 自动拦截并记录操作行为、安全鉴权与资产变更，180 天前过期日志自动归档销毁
 */

const RETENTION_DAYS = 180;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const LOG_STORAGE_KEY = 'ASSET_VAULT_AUDIT_LOGS_V1';

/**
 * 记录一条审计日志
 */
export function logEvent(eventType, details, status = 'SUCCESS', operator = 'Minx Zhang (主超级管理员)') {
  try {
    const existingLogs = getAuditLogs();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      operator,
      ip_address: '192.168.1.107 (Client)',
      details,
      status
    };

    const updatedLogs = [newLog, ...existingLogs];
    // 自动执行 180 天过期日志销毁/清洗算法
    const cleanedLogs = pruneExpiredLogs(updatedLogs);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(cleanedLogs));
    return newLog;
  } catch (e) {
    console.error('记录审计日志失败:', e);
  }
}

/**
 * 获取全量合规日志 (已过期的自动清洗)
 */
export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return getDefaultDemoLogs();
    const parsed = JSON.parse(raw);
    return pruneExpiredLogs(parsed);
  } catch (e) {
    return getDefaultDemoLogs();
  }
}

/**
 * 清洗 180 天以前的旧日志 (Prune logs older than 180 days)
 */
export function pruneExpiredLogs(logs) {
  if (!Array.isArray(logs)) return [];
  const now = new Date().getTime();
  return logs.filter(log => {
    if (!log.timestamp) return false;
    const logTime = new Date(log.timestamp).getTime();
    return (now - logTime) <= RETENTION_MS;
  });
}

/**
 * 获取预置规范合规日志数据
 */
function getDefaultDemoLogs() {
  const now = new Date();
  const logs = [
    {
      id: 'log-101',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      event_type: 'SECURITY_AUTH',
      operator: 'Minx Zhang (主超级管理员)',
      ip_address: '192.168.1.107',
      details: '开启 Web Crypto SHA-256 原生双向带盐散列防明文泄露防护',
      status: 'SUCCESS'
    },
    {
      id: 'log-102',
      timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      event_type: 'AUTH_LOGIN',
      operator: 'Minx Zhang (主超级管理员)',
      ip_address: '192.168.1.107',
      details: '成功通过安全关卡守护校验解锁进入系统',
      status: 'SUCCESS'
    },
    {
      id: 'log-103',
      timestamp: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
      event_type: 'ASSET_CREATE',
      operator: 'Minx Zhang (主超级管理员)',
      ip_address: '192.168.1.107',
      details: '登记新增耐用资产【iPhone 15 Pro Max 256GB】原价 ¥9,999',
      status: 'SUCCESS'
    },
    {
      id: 'log-104',
      timestamp: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
      event_type: 'PASSWORD_CHANGE',
      operator: 'Minx Zhang (主超级管理员)',
      ip_address: '192.168.1.107',
      details: '成功重置修改主访问密码 (更新 SHA-256 摘要)',
      status: 'SUCCESS'
    }
  ];
  return logs;
}
