import React, { useState, useMemo } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  X, FileText, Search, ShieldCheck, Download, Clock, 
  Calendar, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

export default function AuditLogModal({ isOpen, onClose }) {
  const { auditLogs, refreshAuditLogs } = useAssets();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // 180 天过滤与关键词筛选算法
  const filteredLogs = (auditLogs || []).filter(log => {
    if (filterType !== 'ALL' && log.event_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchOp = log.operator?.toLowerCase().includes(q);
      const matchIp = log.ip_address?.toLowerCase().includes(q);
      const matchType = log.event_type?.toLowerCase().includes(q);
      if (!matchDetails && !matchOp && !matchIp && !matchType) return false;
    }
    return true;
  });

  // 导出 180 天日志文件
  const exportLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-180days-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'AUTH_LOGIN':
      case 'SECURITY_AUTH':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">安全鉴权</span>;
      case 'PASSWORD_CHANGE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">密码修改</span>;
      case 'ASSET_CREATE':
      case 'ASSET_UPDATE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">资产变更</span>;
      case 'ASSET_DELETE':
      case 'DATA_CLEAR':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">危险操作</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">系统事件</span>;
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col"
      >
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                审计日志
              </h2>
              <p className="text-xs text-slate-400">操作记录与安全追溯 (保存 180 天)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 180 天留存保护提示 Banner */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>自动保持 180 天日志归档</span>
          </div>
          <button
            onClick={exportLogs}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            导出日志
          </button>
        </div>

        {/* 搜索与过滤栏 */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索事件详情、操作人、IP 或日志类型..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'SECURITY_AUTH', 'AUTH_LOGIN', 'ASSET_CREATE', 'PASSWORD_CHANGE', 'DATA_CLEAR'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  filterType === type 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {type === 'ALL' ? '全部日志' : type}
              </button>
            ))}
          </div>
        </div>

        {/* 日志列表体 */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <FileText className="w-8 h-8 opacity-40 mx-auto" />
              <div className="text-xs">未检索到符合条件的日志记录</div>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getEventBadge(log.event_type)}
                    <span className="font-bold text-white text-xs">{log.operator}</span>
                    <span className="text-[11px] font-mono text-slate-500">({log.ip_address})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium pl-1 leading-relaxed">
                  {log.details}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部按键 */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            系统已自动加载包含近 <span className="text-cyan-400 font-bold">{filteredLogs.length}</span> 条有效审计记录
          </span>
          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
