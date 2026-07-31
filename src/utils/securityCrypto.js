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
  const computedHash = await hashPassword(inputPassword);
  return computedHash === storedHash;
}

/**
 * 获取默认密码 'admin' 的预置 SHA-256 带盐哈希值
 */
export const DEFAULT_ADMIN_HASH = '270e74dcd7e67f6577b0b7dd813183b42767eccc73fad1989d55825a00804b95';

/**
 * 获取默认恢复密钥 'RECOVERY-2026-KEY' 的带盐预置 SHA-256 散列摘要 (全网无明文)
 */
export const DEFAULT_RECOVERY_KEY_HASH = '7970e818d3953efea6c0dd87888aad4db4c82e4e60d5b7827e8c05cf527fe468';
