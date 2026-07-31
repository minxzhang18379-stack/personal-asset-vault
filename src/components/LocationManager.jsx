import React, { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { MapPin, Plus, Box, Bed, BookOpen, Tv, Car, ShieldCheck, ChevronRight, Package } from 'lucide-react';

const ICON_MAP = {
  Bed: Bed,
  BookOpen: BookOpen,
  Tv: Tv,
  Car: Car,
  ShieldCheck: ShieldCheck,
  Package: Package
};

export default function LocationManager() {
  const { locations, assets, consumables, handleSaveLocation, setDetailAsset } = useAssets();
  const [selectedLocId, setSelectedLocId] = useState(locations[0]?.id || 'loc-1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');

  const currentLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  // 计算特定位置下的耐用资产与耗材
  const locAssets = assets.filter(a => a.location_id === selectedLocId);
  const locConsumables = consumables.filter(c => c.location_id === selectedLocId);

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    handleSaveLocation({
      name: newLocName.trim(),
      description: newLocDesc.trim(),
      icon: 'Package'
    });
    setNewLocName('');
    setNewLocDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            家庭与场所收纳空间导航
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            可视化寻找存放位置，快速定位物品归属与密匣/柜屉清单
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-slate-700"
        >
          <Plus className="w-4 h-4" />
          新增收纳地点/柜屉
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧: 收纳位置选择器 */}
        <div className="lg:col-span-4 space-y-3">
          {locations.map((loc) => {
            const IconComp = ICON_MAP[loc.icon] || Package;
            const count = assets.filter(a => a.location_id === loc.id).length;
            const conCount = consumables.filter(c => c.location_id === loc.id).length;
            const isSelected = selectedLocId === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocId(loc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'glass-panel border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{loc.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{loc.description || '无备注说明'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    isSelected 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10' 
                      : 'bg-slate-900/80 text-slate-400 border-slate-800'
                  }`}>
                    {count} 资产 / {conCount} 耗材
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 右侧: 当前位置存放物品明细 */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {currentLoc && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Box className="w-5 h-5 text-cyan-400" />
                    存放于【{currentLoc.name}】的档案列表
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{currentLoc.description}</p>
                </div>
              </div>

              {/* 耐用资产清单 */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">耐用财产物品 ({locAssets.length})</h4>
                {locAssets.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    该收纳位置暂未登记耐用资产
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {locAssets.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setDetailAsset(item)}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.category} • ¥{(item.current_value || 0).toLocaleString()}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 快消耗材清单 */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">快消耗材物品 ({locConsumables.length})</h4>
                {locConsumables.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    该收纳位置暂未登记日用耗材
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {locConsumables.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">{item.name}</div>
                          <div className="text-xs text-slate-400">剩余 {item.quantity} {item.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增收纳位置弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">新增收纳位置/空间柜屉</h3>
            <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">位置名称 *</label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={e => setNewLocName(e.target.value)}
                  placeholder="如：次卧第三抽屉 或 储藏室金属架"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">详细描述说明</label>
                <input
                  type="text"
                  value={newLocDesc}
                  onChange={e => setNewLocDesc(e.target.value)}
                  placeholder="说明该位置的用途或开锁密码"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">取消</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-semibold">保存位置</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
