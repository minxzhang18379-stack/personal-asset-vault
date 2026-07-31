/**
 * Personal Asset Vault - Cloudflare Worker API
 * @module api/worker
 * @see {@link https://github.com/lyrasoft/coding-standards} Lyrasoft Coding Standards
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 开启全局 CORS 支持
app.use('*', cors());

/**
 * GET /api/health - 服务健康检查接口
 */
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/dashboard - 获取仪表盘全量数据 (D1 db.batch 批处理 + 关联 SQL 子查询)
 */
app.get('/api/dashboard', async (c) => {
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: 'Cloudflare D1 未绑定' }, 500);
  }

  try {
    // 采用 D1 原生 batch 批处理将 SQL 合并为单次网络请求发送
    const [assetsRes, consumablesRes, locationsRes] = await db.batch([
      db.prepare(`
        SELECT 
          a.*,
          COALESCE(
            (SELECT json_group_array(json_object('id', att.id, 'type', att.type, 'url', att.url, 'title', att.title))
             FROM asset_attachments att WHERE att.asset_id = a.id),
            '[]'
          ) AS attachments_json
        FROM assets a
        ORDER BY a.created_at DESC
      `),
      db.prepare('SELECT * FROM consumables ORDER BY created_at DESC'),
      db.prepare('SELECT * FROM locations ORDER BY created_at DESC')
    ]);

    // 原生解析图片附件 JSON 数组
    const assets = (assetsRes.results || []).map((asset) => {
      let attachments = [];
      try {
        attachments = typeof asset.attachments_json === 'string'
          ? JSON.parse(asset.attachments_json)
          : (asset.attachments_json || []);
      } catch (e) {
        console.warn('解析附件 JSON 失败:', e);
      }
      delete asset.attachments_json;
      return { ...asset, attachments };
    });

    const consumables = consumablesRes.results || [];
    const locations = locationsRes.results || [];

    return c.json({ assets, consumables, locations });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * POST /api/assets - 新增或保存资产数据
 */
app.post('/api/assets', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = body.id || 'ast-' + Date.now();

  try {
    await db.prepare(`
      INSERT INTO assets (id, name, category, status, purchase_price, current_value, depreciation_rate, purchase_date, warranty_expire_date, location_id, brand, model_number, serial_number, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, body.category || '其它', body.status || 'in_use',
      body.purchase_price || 0, body.current_value || body.purchase_price || 0,
      body.depreciation_rate || 0.1, body.purchase_date || null, body.warranty_expire_date || null,
      body.location_id || null, body.brand || '', body.model_number || '', body.serial_number || '', body.notes || ''
    ).run();

    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * DELETE /api/assets/:id - 根据 ID 删除资产
 */
app.delete('/api/assets/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  try {
    await db.prepare('DELETE FROM assets WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * POST /api/upload - Cloudflare R2 对象存储直传
 */
app.post('/api/upload', async (c) => {
  const bucket = c.env.BUCKET;
  if (!bucket) {
    return c.json({ error: 'Cloudflare R2 Bucket 未绑定' }, 500);
  }

  try {
    const formData = await c.req.parseBody();
    const file = formData['file'];
    if (!file) return c.json({ error: '未接收到文件' }, 400);

    const key = `uploads/${Date.now()}-${file.name}`;
    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    const publicUrl = `https://media.yourdomain.com/${key}`;
    return c.json({ url: publicUrl, key });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
