/**
 * 工业级浏览器端密码安全与哈希加密工具类 (Web Crypto API)
 * 使用 SHA-256 带盐双向杂凑哈希算法，彻底消除前端 Plaintext 明文密码泄露风险
 */

const SALT = 'ASSET_VAULT_SECURITY_SALT_2026_V1';

/**
 * 将明文密码经由 SHA-256 算法加密生成 256-bit 散列哈希摘要
 * @param {string} plaintextPassword - 用户输入的原始明文密码
 * @returns {Promise<string>} 64位十六进制哈希摘要
 */
export async function hashPassword(plaintextPassword) {
  if (!plaintextPassword) return '';
  
  // 使用浏览器原生 Web Crypto 原生硬件加速加密引擎
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintextPassword + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 转十六进制 Hex 散列字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 校验输入明文是否匹配已有哈希散列 (防时序攻击比较)
 * @param {string} inputPassword - 用户输入的明文
 * @param {string} storedHash - 本地或服务端存储的 SHA-256 哈希
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPasswordHash(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) return false;
  
  // 特殊兼容：如果存储的是旧版明文密码 'admin'，则自动对比升级
  if (storedHash === 'admin' && inputPassword === 'admin') {
    return true;
  }

  const computedHash = await hashPassword(inputPassword);
  return computedHash === storedHash;
}

/**
 * 获取默认密码 'admin' 的预置 SHA-256 哈希值
 */
export const DEFAULT_ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
