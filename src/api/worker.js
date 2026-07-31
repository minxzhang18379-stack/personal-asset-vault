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
 * GET /api/dashboard - 获取全量数据 (包含 资产、耗材、位置、账号、开销)
 */
app.get('/api/dashboard', async (c) => {
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: 'Cloudflare D1 未绑定' }, 500);
  }

  try {
    const [assetsRes, consumablesRes, locationsRes, usersRes, expensesRes] = await db.batch([
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
      db.prepare("SELECT * FROM assets WHERE item_type = 'consumable' ORDER BY created_at DESC"),
      db.prepare('SELECT * FROM locations ORDER BY created_at DESC'),
      db.prepare('SELECT * FROM users ORDER BY created_at DESC'),
      db.prepare('SELECT * FROM expenses ORDER BY created_at DESC')
    ]);

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
    const users = (usersRes.results || []).map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      roleName: u.role_name,
      passwordHash: u.password_hash,
      isDefaultPassword: Boolean(u.is_default_password)
    }));
    const expenses = (expensesRes.results || []).map(e => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
      recurring: Boolean(e.recurring),
      notes: e.notes
    }));

    return c.json({ assets, consumables, locations, users, expenses });
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
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, category=excluded.category, status=excluded.status,
        purchase_price=excluded.purchase_price, current_value=excluded.current_value,
        depreciation_rate=excluded.depreciation_rate, purchase_date=excluded.purchase_date,
        warranty_expire_date=excluded.warranty_expire_date, location_id=excluded.location_id,
        brand=excluded.brand, model_number=excluded.model_number, serial_number=excluded.serial_number, notes=excluded.notes
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
 * POST /api/users/update-password - 全端同步更新密码哈希
 */
app.post('/api/users/update-password', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { userId, passwordHash, isDefaultPassword } = body;

  try {
    await db.prepare(`
      UPDATE users SET password_hash = ?, is_default_password = ? WHERE id = ?
    `).bind(passwordHash, isDefaultPassword ? 1 : 0, userId).run();

    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * POST /api/expenses - 新增或修改账单
 */
app.post('/api/expenses', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = body.id || 'exp-' + Date.now();

  try {
    await db.prepare(`
      INSERT INTO expenses (id, title, amount, category, date, recurring, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, amount=excluded.amount, category=excluded.category,
        date=excluded.date, recurring=excluded.recurring, notes=excluded.notes
    `).bind(
      id, body.title, body.amount || 0, body.category || '日常消费',
      body.date || new Date().toISOString().split('T')[0],
      body.recurring ? 1 : 0, body.notes || ''
    ).run();

    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * DELETE /api/expenses/:id - 删除账单
 */
app.delete('/api/expenses/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  try {
    await db.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
