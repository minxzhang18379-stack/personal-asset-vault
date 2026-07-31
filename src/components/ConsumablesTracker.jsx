import React, { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  Package, Plus, Minus, AlertTriangle, Calendar, 
  MapPin, ShoppingCart, Trash2, Edit3, CheckCircle2, Clock 
} from 'lucide-react';

export default function ConsumablesTracker() {
  const { 
    consumables, locations, handleUpdateConsumableQty, 
    handleSaveConsumable, handleDeleteConsumable 
  } = useAssets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '日用品',
    quantity: 1,
    unit: '件',
    min_quantity_alert: 1,
    expiration_date: '',
    location_id: locations[0]?.id || 'loc-1',
    price_per_unit: 0,
    notes: ''
  });

  const getLocationName = (id) => {
    const l = locations.find(loc => loc.id === id);
    return l ? l.name : '未绑定位置';
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: '日用品',
      quantity: 1,
      unit: '件',
      min_quantity_alert: 1,
      expiration_date: '',
      location_id: locations[0]?.id || 'loc-1',
      price_per_unit: 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    handleSaveConsumable({
      ...formData,
      quantity: Number(formData.quantity) || 0,
      min_quantity_alert: Number(formData.min_quantity_alert) || 1,
      price_per_unit: Number(formData.price_per_unit) || 0
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-400" />
            快消耗材与日用品追踪
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            实时管理咖啡胶囊、食品、护肤化妆品及居家备用品的库存与保质期
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-pink-600/20"
        >
          <Plus className="w-4 h-4" />
          登记新耗材
        </button>
      </div>

      {/* 耗材卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {consumables.map((item) => {
          const isLowStock = item.quantity <= (item.min_quantity_alert || 1);
          return (
            <div
              key={item.id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isLowStock 
                  ? 'border-pink-500/50 bg-pink-950/15 hover:border-pink-500/80 hover:shadow-xl hover:shadow-pink-500/10' 
                  : 'border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5'
              }`}
            >
              <div>
                {/* 顶部标签 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-pink-300 border border-pink-500/30">
                    {item.category}
                  </span>
                  {isLowStock && (
                    <span className="flex items-center gap-1 text-xs font-bold text-pink-400 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> 低库存预警
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base mb-1">{item.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  存放于：<span className="text-cyan-300 font-medium">{getLocationName(item.location_id)}</span>
                </div>

                {/* 数量调整与加减器 */}
                <div className="my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">当前剩余数量</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateConsumableQty(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      -
                    </button>
                    <span className="font-mono text-lg font-bold text-white w-12 text-center">
                      {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </span>
                    <button
                      onClick={() => handleUpdateConsumableQty(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 保质期 */}
                {item.expiration_date && (
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    保质期截止日：<span className="text-amber-300 font-mono font-semibold">{item.expiration_date}</span>
                  </div>
                )}
              </div>

              {/* 底部操作 */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">单价约 ¥{item.price_per_unit || 0}</span>
                <button
                  onClick={() => handleDeleteConsumable(item.id)}
                  className="text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增耗材 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">登记快消耗材/日用品</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">耗材品名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：Nespresso 咖啡胶囊 或 神仙水"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">耗材分类</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="食品饮料">食品饮料</option>
                    <option value="护肤彩妆">护肤彩妆</option>
                    <option value="医药保健">医药保健</option>
                    <option value="办公耗材">办公耗材</option>
                    <option value="居家清洁">居家清洁</option>
                    <option value="日用品">日用品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">存放位置</label>
                  <select
                    value={formData.location_id}
                    onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">初始库存</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">计量单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="件/盒/粒"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">预警阈值</label>
                  <input
                    type="number"
                    value={formData.min_quantity_alert}
                    onChange={e => setFormData({ ...formData, min_quantity_alert: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">保质期到期日</label>
                <input
                  type="date"
                  value={formData.expiration_date}
                  onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">取消</button>
                <button type="submit" className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2 rounded-xl font-semibold">保存耗材</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
