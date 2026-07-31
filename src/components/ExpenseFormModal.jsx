import React, { useState, useEffect } from 'react';
import { useAssets } from '../context/AssetContext';
import { X, CreditCard, Calendar, Tag, DollarSign, Repeat, FileText } from 'lucide-react';

const CATEGORY_OPTIONS = [
  '日常消费',
  '固定资产',
  '耗材补给',
  '房屋水电',
  '订阅服务',
  '娱乐餐饮',
  '其它'
];

export default function ExpenseFormModal() {
  const { editingExpense, setEditingExpense, handleSaveExpense } = useAssets();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '日常消费',
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
    notes: ''
  });

  useEffect(() => {
    if (editingExpense && editingExpense.id) {
      setFormData({
        title: editingExpense.title || '',
        amount: editingExpense.amount || '',
        category: editingExpense.category || '日常消费',
        date: editingExpense.date || new Date().toISOString().slice(0, 10),
        recurring: Boolean(editingExpense.recurring),
        notes: editingExpense.notes || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: '日常消费',
        date: new Date().toISOString().slice(0, 10),
        recurring: false,
        notes: ''
      });
    }
  }, [editingExpense]);

  if (!editingExpense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    handleSaveExpense({
      ...editingExpense,
      title: formData.title.trim(),
      amount: Number(formData.amount) || 0,
      category: formData.category,
      date: formData.date,
      recurring: formData.recurring,
      notes: formData.notes.trim()
    });

    setEditingExpense(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col"
      >
        {/* 头部标题 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              {editingExpense.id ? '编辑开销账单' : '记笔账单'}
            </h2>
          </div>
          <button
            onClick={() => setEditingExpense(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* 事项名称 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              事项名称 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder=""
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 金额 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                开销金额 (¥) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder=""
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-bold text-base"
              />
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                开销日期 *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              开销分类
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map(cat => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 经常性固定开销开关 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">经常性固定支出</div>
                <div className="text-[10px] text-slate-400">如房租/水电/iCloud/包月订阅</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">备注说明</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder=""
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 底部按钮 */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-600/20"
            >
              保存账单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
