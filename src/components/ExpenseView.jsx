import React, { useState, useMemo } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  CreditCard, PlusCircle, Calendar, TrendingUp, Wallet, 
  Repeat, ArrowUpRight, ArrowDownRight, Edit3, Trash2, Tag, Search, Layers, Clock, Sparkles
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  '日常消费': '#06b6d4',
  '固定资产': '#3b82f6',
  '耗材补给': '#ec4899',
  '房屋水电': '#eab308',
  '订阅服务': '#8b5cf6',
  '娱乐餐饮': '#10b981',
  '其它': '#94a3b8'
};

export default function ExpenseView() {
  const { expenses, setEditingExpense, handleDeleteExpense } = useAssets();

  // 默认当月 YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 历史有记录的月份列表
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    const now = new Date();
    monthSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    
    expenses.forEach(e => {
      if (e.date) {
        monthSet.add(e.date.slice(0, 7));
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [expenses]);

  // 当月账单
  const monthExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // 上月账单（用于计算环比）
  const lastMonthStr = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const lastMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(lastMonthStr));
  }, [expenses, lastMonthStr]);

  // 核心统计指标
  const stats = useMemo(() => {
    const currentTotal = monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const lastTotal = lastMonthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const recurringTotal = monthExpenses
      .filter(item => item.recurring)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    let momRate = 0;
    if (lastTotal > 0) {
      momRate = (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1);
    }

    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const dailyAvg = (currentTotal / daysInMonth).toFixed(0);

    return {
      currentTotal,
      lastTotal,
      recurringTotal,
      momRate: Number(momRate),
      dailyAvg: Number(dailyAvg),
      billCount: monthExpenses.length
    };
  }, [monthExpenses, lastMonthExpenses, selectedMonth]);

  // 6 个月开销趋势 (AreaChart)
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = 0;
    }

    expenses.forEach(e => {
      if (e.date) {
        const mKey = e.date.slice(0, 7);
        if (monthMap[mKey] !== undefined) {
          monthMap[mKey] += Number(e.amount) || 0;
        }
      }
    });

    return Object.keys(monthMap).sort().map(mKey => ({
      name: mKey.replace('-', '/'),
      value: monthMap[mKey]
    }));
  }, [expenses]);

  // 分类占比 (PieChart)
  const categoryData = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => {
      const cat = e.category || '其它';
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    });

    return Object.keys(map).map(cat => ({
      name: cat,
      value: map[cat],
      color: CATEGORY_COLORS[cat] || '#94a3b8'
    }));
  }, [monthExpenses]);

  // 过滤后的明细列表
  const filteredList = useMemo(() => {
    return monthExpenses.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesQuery = !searchQuery.trim() || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchesCategory && matchesQuery;
    });
  }, [monthExpenses, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 select-none">
      {/* 顶部标语与控制按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            开销统计
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            月度收支与账单分析
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 月份选择下拉框 */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m.replace('-', '年')}月账单
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setEditingExpense({})}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-cyan-600/20 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            记笔账单
          </button>
        </div>
      </div>

      {/* 4 项核心数据指标卡片 (参照 Dashboard 极佳视觉风格) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 卡片 1: 当月开销总额 (Cyan 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">当月开销总额</span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.currentTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-300 font-semibold mt-2.5">
              {stats.momRate >= 0 ? (
                <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  + {stats.momRate}% 环比上月增加
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {stats.momRate}% 环比上月下降
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 卡片 2: 日均开销额 (Blue 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">日均开销额</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.dailyAvg.toLocaleString()}
            </div>
            <div className="text-xs text-blue-300 font-semibold mt-2.5">
              按照当月天数均摊计算
            </div>
          </div>
        </div>

        {/* 卡片 3: 经常性固定支出 (Purple 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">经常性固定支出</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ¥ {stats.recurringTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-purple-300 font-semibold mt-2.5">
              包含房租、水电及包月订阅
            </div>
          </div>
        </div>

        {/* 卡片 4: 账单总笔数 (Emerald 主题) */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200 tracking-tight">账单总笔数</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.billCount} <span className="text-sm font-normal text-slate-400">笔</span>
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-2.5">
              已成功录入系统
            </div>
          </div>
        </div>
      </div>

      {/* 图表展示区: 左侧分类占比，右侧历史月度开销趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧: 资产与开销分类占比 */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              开销分类支出占比
            </h3>
            <p className="text-xs text-slate-400 mt-1">按当月各大类开销金额分布统计 ({selectedMonth})</p>
          </div>
          
          {categoryData.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="h-64 my-4 flex items-center justify-center text-xs text-slate-500">
              当月暂无开销支出记录
            </div>
          )}
        </div>

        {/* 右侧: 历史月度开销趋势分析 */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              历史月度开销趋势
            </h3>
            <p className="text-xs text-slate-400 mt-1">近 6 个月历史支出金额演变趋势</p>
          </div>
          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} formatter={(v) => `¥${v}`} />
                <Tooltip 
                  formatter={(v) => `¥ ${v.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff' }}
                  cursor={{ stroke: 'rgba(56, 189, 248, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              当月最大支出比重：<strong>{categoryData[0]?.name || '日常消费'} (约占 {stats.currentTotal > 0 && categoryData[0] ? ((categoryData[0].value / stats.currentTotal) * 100).toFixed(0) : 0}%)</strong>
            </span>
            <span className="text-slate-400">实时统计</span>
          </div>
        </div>
      </div>

      {/* 底部账单明细列表面板 */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            账单明细列表 ({filteredList.length})
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* 搜索框 */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索账单事项或备注..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* 分类筛选 Pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
              {['ALL', '日常消费', '固定资产', '耗材补给', '房屋水电', '订阅服务', '娱乐餐饮', '其它'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? '全部分类' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 明细卡片网格 */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      {item.recurring && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          固定周期
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <div className="text-lg font-black text-white font-mono">
                    ¥ {Number(item.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                    {item.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingExpense(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <CreditCard className="w-8 h-8 text-slate-600" />
            当月暂无相应开销账单记录
          </div>
        )}
      </div>
    </div>
  );
}
