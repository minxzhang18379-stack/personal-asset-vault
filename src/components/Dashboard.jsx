import React from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  TrendingUp, Wallet, ShieldAlert, Sparkles, Package, ArrowUpRight, 
  Clock, AlertTriangle, AlertCircle, PlusCircle, Layers, CheckCircle2 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

const CATEGORY_COLORS = {
  '交通工具': '#3b82f6',
  '电子产品': '#06b6d4',
  '珠宝首饰': '#eab308',
  '服饰鞋包': '#ec4899',
  '房产不动产': '#10b981',
  '其它': '#8b5cf6'
};

export default function Dashboard() {
  const { assets, stats, setActiveTab, setEditingAsset, setDetailAsset, locations } = useAssets();

  // 按分类计算当前价值占比数据（供饼图使用）
  const categoryData = React.useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const cat = a.category || '其它';
      const val = Number(a.current_value) || 0;
      map[cat] = (map[cat] || 0) + val;
    });
    return Object.keys(map).map(cat => ({
      name: cat,
      value: map[cat],
      color: CATEGORY_COLORS[cat] || '#94a3b8'
    }));
  }, [assets]);

  // 按购买年份折旧估值模拟（供趋势图使用）
  const trendData = React.useMemo(() => {
    return [
      { name: '购买原值', value: stats.totalPurchaseValue },
      { name: '第1年估值', value: Math.round(stats.totalPurchaseValue * 0.88) },
      { name: '第2年估值', value: Math.round(stats.totalPurchaseValue * 0.78) },
      { name: '当前实时净值', value: stats.totalCurrentValue }
    ];
  }, [stats]);

  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : '未分类位置';
  };

  return (
    <div className="space-y-8">
      {/* 顶部标语与新增按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            资产财务大盘 <Sparkles className="w-6 h-6 text-cyan-400 glow-animation" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            实时掌握个人及家庭全量耐用财产折旧、快消耗材与保修防线
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingAsset({})}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            新增财产资产
          </button>
        </div>
      </div>

      {/* 4 项核心数据指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 卡片 1: 实时净资产估值 (Cyan 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">当前总估值 (净资产)</span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.totalCurrentValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-300 font-semibold mt-2.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              包含 {stats.assetCount} 件登记耐用资产
            </div>
          </div>
        </div>

        {/* 卡片 2: 原始采购总成本 (Blue 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">购买历史原值成本</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.totalPurchaseValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-300 font-semibold mt-2.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              购置总投入成本额
            </div>
          </div>
        </div>

        {/* 卡片 3: 累计计算折旧额 (Purple 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">累计计算折旧损耗</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.totalDepreciation.toLocaleString()}
            </div>
            <div className="text-xs text-purple-300 font-semibold mt-2.5">
              综合年化折旧率为 {stats.totalPurchaseValue ? ((stats.totalDepreciation / stats.totalPurchaseValue) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* 卡片 4: 待关注预警提醒 (Amber 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">急需处理预警</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              {stats.expiringWarranties.length + stats.lowStockConsumables.length} <span className="text-sm font-normal text-slate-400">项</span>
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-2.5">
              {stats.expiringWarranties.length} 项保修到期 / {stats.lowStockConsumables.length} 项低库存耗材
            </div>
          </div>
        </div>
      </div>

      {/* 图表展示区: 左侧分类占比饼图，右侧折旧保值曲线 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧: 资产分类价值占比 */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              资产分类价值占比
            </h3>
            <p className="text-xs text-slate-400 mt-1">按各大类当前估值分布统计</p>
          </div>
          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `¥ ${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 truncate">{cat.name}</span>
                <span className="ml-auto font-semibold text-white">¥{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧: 估值与折旧保值趋势分析 */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              资产估值与折旧保值分析
            </h3>
            <p className="text-xs text-slate-400 mt-1">耐用财产自购置起的价值演变趋势</p>
          </div>
          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} formatter={(v) => `¥${v/1000}k`} />
                <Tooltip 
                  formatter={(v) => `¥ ${v.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff' }}
                  cursor={{ stroke: 'rgba(56, 189, 248, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              保值率最高的资产类别：<strong>珠宝首饰 / 欧米茄机械表 (年折旧系数 3%)</strong>
            </span>
            <button onClick={() => setActiveTab('analytics')} className="underline hover:text-white">查看完整财务报告 &rarr;</button>
          </div>
        </div>
      </div>

      {/* 底部面板: 预警通知与即时清单 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左面板: 临近保修到期提醒 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              保修到期防线预警 ({stats.expiringWarranties.length})
            </h3>
            <button onClick={() => setActiveTab('assets')} className="text-xs text-slate-400 hover:text-white">查看全量资产</button>
          </div>
          {stats.expiringWarranties.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80" />
              目前没有 30 天内即要过保修期的高价值资产
            </div>
          ) : (
            <div className="space-y-3">
              {stats.expiringWarranties.map(asset => (
                <div key={asset.id} onClick={() => setDetailAsset(asset)} className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{asset.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">位置：{getLocationName(asset.location_id)}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {asset.warranty_expire_date} 到期
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右面板: 耗材补货与保质期预警 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-400" />
              快消耗材补货预警 ({stats.lowStockConsumables.length})
            </h3>
            <button onClick={() => setActiveTab('consumables')} className="text-xs text-slate-400 hover:text-white">进入耗材清单</button>
          </div>
          {stats.lowStockConsumables.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80" />
              日常耗材库存充足，无缺货预警
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockConsumables.map(con => (
                <div key={con.id} onClick={() => setActiveTab('consumables')} className="p-3.5 rounded-xl bg-slate-900/60 border border-pink-500/20 hover:border-pink-500/40 cursor-pointer transition-all flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{con.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">分类：{con.category} | 存放在：{getLocationName(con.location_id)}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      仅剩 {con.quantity} {con.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
