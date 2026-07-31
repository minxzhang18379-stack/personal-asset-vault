import React from 'react';
import { PackageOpen, PlusCircle } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = '暂无符合条件的记录', 
  description = '未检索到相关的资产或物品，您可以更改筛选条件或新建登记。', 
  actionText = '登记新资产', 
  onAction = null 
}) {
  return (
    <div className="glass-panel p-10 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center glow-animation">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
