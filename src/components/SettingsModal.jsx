import React from 'react';
import { useAssets } from '../context/AssetContext';
import { X, Download, Upload, RefreshCw, Cloud, Database, ShieldCheck, Trash2 } from 'lucide-react';
import { ApiService } from '../services/apiService';

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, setIsSecurityModalOpen, setIsAuditLogOpen, handleResetData, handleClearAllData, refreshData } = useAssets();

  if (!isSettingsOpen) return null;

  // 导出全量 JSON 备份
  const exportBackup = async () => {
    const data = await ApiService.getDashboardData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON 备份
  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.assets || imported.consumables) {
          localStorage.setItem('PERSONAL_ASSET_VAULT_DATA_V2', JSON.stringify(imported));
          await refreshData();
          alert('数据备份成功还原导入！');
        } else {
          alert('无效的备份文件格式');
        }
      } catch (err) {
        alert('解析备份 JSON 失败: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden p-6 border border-slate-700/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cyan-400" />
            系统设置与 Cloudflare 云服务
          </h2>
          <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 托管状态与 Cloudflare D1 检查 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">云端托管状态</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cloudflare Pages Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            绑定 Cloudflare D1 (SQLite) 数据库与 Cloudflare R2 对象存储，支持全端数据同步与凭证云备份。
          </p>
        </div>

        {/* 用户密码与审计日志控制 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">安全与 180 天合规日志</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsSecurityModalOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-bold transition-all shadow-md shadow-amber-500/5 active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                修改守护密码
              </span>
              <span className="text-[10px] text-amber-400/80 underline">&rarr;</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsAuditLogOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs font-bold transition-all shadow-md shadow-cyan-500/5 active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                180 天合规日志
              </span>
              <span className="text-[10px] text-cyan-400/80 underline">&rarr;</span>
            </button>
          </div>
        </div>

        {/* 数据备份与恢复 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">数据安全与离线备份</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportBackup}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              导出 JSON 数据备份
            </button>
            <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-400" />
              导入数据备份
              <input type="file" accept=".json" onChange={importBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* 危险区域：清空与重置 */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">危险操作与演示重置</h4>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleResetData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              恢复演示数据
            </button>
            <button
              onClick={handleClearAllData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              一键彻底清空数据
            </button>
          </div>
        </div>

        {/* 底部关闭 */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl text-xs font-bold"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
