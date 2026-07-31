import React from 'react';
import { useAssets } from '../context/AssetContext';
import { BarChart3, TrendingDown, DollarSign, Award, ArrowDownRight, PieChart as PieIcon, ShieldCheck, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsView() {
  const { assets, stats, setIsSettingsOpen } = useAssets();

  // 按分类计算原价 vs 当前估值
  const categoryComparison = React.useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const cat = a.category || '其它';
      if (!map[cat]) map[cat] = { name: cat, purchase: 0, current: 0 };
      map[cat].purchase += Number(a.purchase_price) || 0;
      map[cat].current += Number(a.current_value) || 0;
    });
    return Object.values(map);
  }, [assets]);

  // 计算估值保留率最高的 Top 资产
  const topValueHolders = React.useMemo(() => {
    return [...assets]
      .filter(a => a.purchase_price > 0)
      .map(a => ({
        ...a,
        retentionRate: ((a.current_value / a.purchase_price) * 100).toFixed(1)
      }))
      .sort((a, b) => b.retentionRate - a.retentionRate)
      .slice(0, 5);
  }, [assets]);

  return (
    <div className="space-y-8">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            财务分析
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            资产分类与折旧分析
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          title="系统设置"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 核心财务指标图表 */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">购置原价 vs 当前估值</h3>
        <p className="text-xs text-slate-400 mb-6">各分类保值与折旧对比</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryComparison}>
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} formatter={(v) => `¥${v/1000}k`} />
              <Tooltip 
                formatter={(val) => `¥ ${val.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                itemStyle={{ color: '#ffffff' }}
                labelStyle={{ color: '#ffffff' }}
                cursor={{ fill: 'rgba(56, 189, 248, 0.08)', rx: 8 }}
              />
              <Bar dataKey="purchase" name="购买原价" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" name="当前估值" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 资产保值率榜单 Top 5 */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          财产保值率 Top 5 榜单 (残值留存比率)
        </h3>
        <div className="space-y-3">
          {topValueHolders.map((item, idx) => {
            let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
            if (idx === 0) badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10 font-black";
            if (idx === 1) badgeStyle = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold";
            if (idx === 2) badgeStyle = "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10 font-bold";

            return (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border ${badgeStyle}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.category} • 原价 <span className="font-mono text-slate-200">¥{(item.purchase_price || 0).toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-cyan-300 font-mono">{item.retentionRate}%</div>
                  <div className="text-xs text-slate-400">估值 <span className="font-mono text-cyan-400">¥{(item.current_value || 0).toLocaleString()}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
