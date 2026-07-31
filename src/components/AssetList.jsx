import React, { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  Search, Filter, Plus, LayoutGrid, List, Tag, MapPin, Box, Settings, PackageOpen, Flame,
  Eye, Edit3, Trash2, Calendar, ShieldCheck, FileText, Image as ImageIcon,
  Smartphone, Tablet, Laptop, Monitor, Tv, Gamepad2, Headphones, Speaker, Camera, Watch, Cpu, HardDrive, Printer, Wifi,
  Car, Bike, Plane, Ship, Fuel,
  Home, Bed, Sofa, Lamp, Coffee, Utensils, Wine, Shirt, Scissors,
  Gem, Sparkles, Crown, Briefcase, Glasses,
  Key, CreditCard
} from 'lucide-react';
import EmptyState from './EmptyState';
import { calculateDailyCost } from '../utils/costCalculator';

const STATUS_OPTIONS = [
  { key: 'ALL', label: '全部状态' },
  { key: 'in_use', label: '在用中' },
  { key: 'idle', label: '闲置储藏' },
  { key: 'repair', label: '维保维护' },
  { key: 'sold', label: '二手转售' }
];

const ICON_MAP = {
  Smartphone, Tablet, Laptop, Monitor, Tv, Gamepad2, Headphones, Speaker, Camera, Watch, Cpu, HardDrive, Printer, Wifi,
  Car, Bike, Plane, Ship, Fuel,
  Home, Bed, Sofa, Lamp, Coffee, Utensils, Wine, Shirt, Scissors,
  Gem, Sparkles, Crown, Briefcase, Glasses, Tag,
  Box, Key, ShieldCheck, CreditCard
};

export default function AssetList() {
  const { 
    assets, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, 
    categories, setDetailAsset, setEditingAsset, handleDeleteAsset, locations, setIsSettingsOpen 
  } = useAssets();

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('current_value_desc');
  const [viewMode, setViewMode] = useState('grid');

  const categoryPills = ['ALL', ...categories];

  const getLocationName = (locId) => {
    const l = locations.find(loc => loc.id === locId);
    return l ? l.name : '未绑定位置';
  };

  // 渲染放大版 Apple SF 风格图标 (支持用户自定义配置 + 自动退化匹配)
  const renderAppleAssetIcon = (asset) => {
    if (asset.icon && ICON_MAP[asset.icon]) {
      const CustomIconComp = ICON_MAP[asset.icon];
      return (
        <div className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5 shrink-0 group-hover:border-cyan-500/50 transition-colors">
          <CustomIconComp className="w-6 h-6 text-cyan-400" />
        </div>
      );
    }

    const name = (asset.name || '').toLowerCase();
    const cat = (asset.category || '').toLowerCase();
    const brand = (asset.brand || '').toLowerCase();

    let IconComponent = Box;
    if (name.includes('iphone') || name.includes('手机') || (brand.includes('apple') && (name.includes('phone') || name.includes('15') || name.includes('14')))) {
      IconComponent = Smartphone;
    } else if (name.includes('macbook') || name.includes('电脑') || name.includes('mac') || name.includes('pro 16') || cat.includes('电子')) {
      IconComponent = Laptop;
    } else if (name.includes('tesla') || name.includes('车') || name.includes('model') || cat.includes('交通')) {
      IconComponent = Car;
    } else if (name.includes('表') || name.includes('watch') || name.includes('超霸') || name.includes('欧米茄') || cat.includes('珠宝')) {
      IconComponent = Watch;
    } else if (name.includes('冲锋衣') || name.includes('始祖鸟') || name.includes('衣') || name.includes('鞋') || cat.includes('服饰')) {
      IconComponent = Shirt;
    } else if (name.includes('咖啡') || name.includes('胶囊') || cat.includes('食品')) {
      IconComponent = Coffee;
    } else if (cat.includes('房产') || name.includes('房')) {
      IconComponent = Home;
    }

    return (
      <div className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5 shrink-0 group-hover:border-cyan-500/50 transition-colors">
        <IconComponent className="w-6 h-6 text-cyan-400" />
      </div>
    );
  };

  // 渲染干净、精致高对比度的状态 Badge（带呼吸点与黑调背衬）
  const renderStatusBadge = (statusKey) => {
    switch (statusKey) {
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-950/85 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0" />
            在用中
          </span>
        );
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-950/85 text-cyan-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-cyan-500/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            闲置储藏
          </span>
        );
      case 'repair':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-950/85 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-500/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            维保维护
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-950/85 text-purple-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-purple-500/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            二手已售
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-950/85 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            在用中
          </span>
        );
    }
  };

  // 过滤与排序算法（包含按日均持用成本排序）
  const filteredAssets = React.useMemo(() => {
    return assets.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchSn = item.serial_number?.toLowerCase().includes(q);
        const matchLoc = getLocationName(item.location_id).toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSn && !matchLoc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'daily_cost_desc') {
        const costA = Number(calculateDailyCost(a.purchase_price, a.purchase_date, a.current_value).grossDailyCost) || 0;
        const costB = Number(calculateDailyCost(b.purchase_price, b.purchase_date, b.current_value).grossDailyCost) || 0;
        return costB - costA;
      }
      if (sortBy === 'current_value_desc') return (b.current_value || 0) - (a.current_value || 0);
      if (sortBy === 'purchase_price_desc') return (b.purchase_price || 0) - (a.purchase_price || 0);
      if (sortBy === 'purchase_date_desc') return new Date(b.purchase_date || 0) - new Date(a.purchase_date || 0);
      return 0;
    });
  }, [assets, selectedCategory, selectedStatus, searchQuery, sortBy, locations]);

  return (
    <div className="space-y-6">
      {/* 头部功能栏 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-cyan-400" />
            资产档案
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            共 <span className="font-extrabold text-cyan-400 font-mono text-xs px-0.5">{filteredAssets.length}</span> 项固定资产
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setEditingAsset({})}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-md shadow-cyan-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            新增资产
          </button>
        </div>
      </div>

      {/* 搜索与多维度筛选栏 */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资产名称、品牌型号、序列号或存放位置..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* 状态过滤与排序 */}
        <div className="flex items-center flex-wrap gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="daily_cost_desc">🔥 按日均使用成本从高到低</option>
            <option value="current_value_desc">按当前估值从高到低</option>
            <option value="purchase_price_desc">按原价从高到低</option>
            <option value="purchase_date_desc">按购买日期最新</option>
          </select>

          {/* 视图切换按钮 */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="卡片网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="表格明细视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 分类 Pills 胶囊选项卡 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryPills.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? '全部大类' : cat}
          </button>
        ))}
      </div>

      {/* 检索空状态处理 */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="未检索到任何符合条件的资产记录"
          description="尝试调整搜索关键字或大类筛选条件，也可以直接点击下方按钮登记新资产。"
          actionText="登记第一件资产"
          onAction={() => setEditingAsset({})}
        />
      ) : (
        <>
          {/* 网格视图模式 (Grid Mode) */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssets.map((asset) => {
                const firstImg = asset.attachments && asset.attachments.length > 0 ? asset.attachments[0].url : null;
                const dailyMetrics = calculateDailyCost(asset.purchase_price, asset.purchase_date, asset.current_value);

                return (
                  <div
                    key={asset.id}
                    className="glass-panel glass-card-hover rounded-2xl overflow-hidden group flex flex-col justify-between border border-slate-800"
                  >
                    <div>
                      {/* 图片展示区与状态浮层 */}
                      <div className="h-44 bg-slate-900/80 relative overflow-hidden flex items-center justify-center group/img">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 opacity-90 group-hover:opacity-100 transition-all duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-600">
                            <ImageIcon className="w-10 h-10" />
                            <span className="text-xs">暂无上传实物照</span>
                          </div>
                        )}

                        {/* 顶部贯穿式柔和渐变阴影 (保证顶部整体极其干净规整) */}
                        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950/85 via-slate-950/35 to-transparent pointer-events-none z-10 opacity-90 group-hover/img:opacity-75 transition-opacity" />

                        {/* 底部评估残值渐变阴影 */}
                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none z-10" />

                        {/* 左上分类与状态 Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                          <span className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-cyan-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                            {asset.category}
                          </span>
                          {renderStatusBadge(asset.status)}
                        </div>

                        {/* 估值浮层 */}
                        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-right z-10 shadow-lg">
                          <div className="text-[10px] text-slate-400 font-medium">当前评估价值</div>
                          <div className="text-sm font-extrabold text-cyan-300 font-mono">¥ {(asset.current_value || 0).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* 信息主体：带显著大图标与日均成本展示 */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3.5">
                          {renderAppleAssetIcon(asset)}
                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() => setDetailAsset(asset)}
                              className="font-bold text-white text-base hover:text-cyan-400 cursor-pointer transition-colors line-clamp-1 tracking-tight"
                            >
                              {asset.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              {asset.brand && <span className="font-semibold text-slate-300">{asset.brand}</span>}
                              {asset.model_number && <span>• {asset.model_number}</span>}
                            </div>
                          </div>
                        </div>

                        {/* 购买原价 & 日均使用成本双核心面板 */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                          <div>
                            <span className="text-slate-500 block">购买原价</span>
                            <span className="text-white font-mono font-bold">¥ {(asset.purchase_price || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              日均使用成本
                            </span>
                            <span className="text-amber-300 font-mono font-extrabold">
                              {dailyMetrics.formattedGross}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 底部操作按钮 */}
                    <div className="px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between">
                      <button
                        onClick={() => setDetailAsset(asset)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看详情
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="编辑资产"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-slate-400 hover:text-rose-400 transition-colors"
                          title="删除资产"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 表格明细视图模式 (Table Mode) */}
          {viewMode === 'table' && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-4">资产名称</th>
                      <th className="p-4">大类</th>
                      <th className="p-4">状态</th>
                      <th className="p-4">购买原价</th>
                      <th className="p-4">🔥 日均成本</th>
                      <th className="p-4">评估残值</th>
                      <th className="p-4">存放位置</th>
                      <th className="p-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredAssets.map(asset => {
                      const dailyMetrics = calculateDailyCost(asset.purchase_price, asset.purchase_date, asset.current_value);
                      return (
                        <tr key={asset.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-bold text-white">
                            <div className="flex items-center gap-3">
                              {renderAppleAssetIcon(asset)}
                              <div>
                                <span
                                  onClick={() => setDetailAsset(asset)}
                                  className="hover:text-cyan-400 cursor-pointer text-sm"
                                >
                                  {asset.name}
                                </span>
                                {asset.brand && <span className="text-slate-400 text-xs font-normal ml-2">({asset.brand})</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-cyan-300">
                              {asset.category}
                            </span>
                          </td>
                          <td className="p-4">{renderStatusBadge(asset.status)}</td>
                          <td className="p-4 font-mono font-semibold text-white">¥ {(asset.purchase_price || 0).toLocaleString()}</td>
                          <td className="p-4 font-mono font-extrabold text-amber-300">{dailyMetrics.formattedGross}</td>
                          <td className="p-4 font-mono font-bold text-cyan-300">¥ {(asset.current_value || 0).toLocaleString()}</td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                              {getLocationName(asset.location_id)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => setDetailAsset(asset)}
                                className="text-cyan-400 hover:text-cyan-300 font-semibold"
                              >
                                详情
                              </button>
                              <button
                                onClick={() => setEditingAsset(asset)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
