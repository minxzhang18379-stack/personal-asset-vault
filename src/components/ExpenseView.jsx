import React, { useState, useMemo } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  CreditCard, Plus, Calendar, TrendingDown, DollarSign, 
  Repeat, ArrowUpRight, ArrowDownRight, Edit3, Trash2, Tag, Search, Filter 
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

  // 当前选中的查看月份 (默认当月 YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 提取所有有记录的月份选项
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

  // 1. 过滤当前选定月份的账单
  const monthExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // 2. 计算上个月标识与账单 (用于环比)
  const lastMonthStr = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const lastMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(lastMonthStr));
  }, [expenses, lastMonthStr]);

  // 核心开销数据汇总
  const stats = useMemo(() => {
    const currentTotal = monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const lastTotal = lastMonthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const recurringTotal = monthExpenses
      .filter(item => item.recurring)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // 环比百分比
    let momRate = 0;
    if (lastTotal > 0) {
      momRate = (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1);
    }

    // 计算当月日均
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

  // 近 12 个月月度开销趋势数据 (AreaChart)
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};
    // 预填最近 6 个月
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
        } else {
          monthMap[mKey] = Number(e.amount) || 0;
        }
      }
    });

    return Object.keys(monthMap).sort().map(mKey => ({
      month: mKey.replace('-', '/'),
      total: monthMap[mKey]
    }));
  }, [expenses]);

  // 当月分类开销占比数据 (PieChart)
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

  // 按分类与搜索条件进一步过滤账单列表
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
      {/* 头部与月份选择 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            开销统计
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            月度收支与账单分析
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 月份选择器 */}
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
            <Plus className="w-4 h-4" />
            记笔账单
          </button>
        </div>
      </div>

      {/* 4 项核心开销指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 卡片 1: 当月总支出 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">当月总开销</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              ¥ {stats.currentTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] mt-2 font-semibold">
              {stats.momRate >= 0 ? (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  + {stats.momRate}% 环比增幅
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {stats.momRate}% 环比下降
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 卡片 2: 日均支出 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">日均支出额</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              ¥ {stats.dailyAvg.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ 天</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">基于当月天数均摊</div>
          </div>
        </div>

        {/* 卡片 3: 经常性固定开销 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">经常性固定支出</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              ¥ {stats.recurringTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-purple-400/80 mt-2 font-semibold">订阅/房租/水电固定开销</div>
          </div>
        </div>

        {/* 卡片 4: 账单总笔数 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">当月账单笔数</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {stats.billCount} <span className="text-xs font-normal text-slate-400">笔记录</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 font-semibold">录入账单笔数</div>
          </div>
        </div>
      </div>

      {/* 2 个可视化图表：月度趋势 + 分类占比 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 图表 1: 近 6 个月历史开销趋势 (AreaChart) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
              历史月度开销趋势
            </h3>
            <span className="text-xs text-slate-400">近 6 个月消费总额</span>
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} formatter={(v) => `¥${v}`} />
                <Tooltip 
                  formatter={(val) => `¥ ${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="total" name="月开销总额" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 图表 2: 当月分类开销占比 (PieChart) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              当月开销分类占比
            </h3>
            <span className="text-xs text-slate-400">{selectedMonth}</span>
          </div>

          {categoryData.length > 0 ? (
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => `¥ ${val.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              当月暂无开销数据
            </div>
          )}

          {/* 分类图例说明 */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 开销明细账单列表 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            账单明细列表 ({filteredList.length})
          </h3>

          <div className="flex items-center gap-3">
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

        {/* 账单卡片列表 */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(item => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
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
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <div className="text-base font-black text-white font-mono">
                    ¥ {Number(item.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
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
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">当月暂无相应开销账单</div>
            <p className="text-xs text-slate-500">点击右上角【记笔账单】录入支出</p>
          </div>
        )}
      </div>
    </div>
  );
}
