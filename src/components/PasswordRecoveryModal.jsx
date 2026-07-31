import React, { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  X, ShieldAlert, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Lock, Eye, EyeOff
} from 'lucide-react';

export default function PasswordRecoveryModal({ isOpen, onClose }) {
  const { handleForceResetPassword, showToast } = useAssets();
  
  const [accountInput, setAccountInput] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('新密码不能少于 4 位字符');
      return;
    }

    try {
      setIsSubmitting(true);
      await handleForceResetPassword(accountInput, recoveryKey, newPassword);
      setSuccessMsg(`账户【${accountInput}】密码已成功强制重置！新密码即刻生效。`);
      setAccountInput('');
      setRecoveryKey('');
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) showToast('密码重置成功', 'success');
    } catch (err) {
      setErrorMsg(err.message || '强制重置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 flex flex-col"
      >
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">应急强制重置密码</h2>
              <p className="text-xs text-slate-400">使用安全恢复密钥重置密码</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 恢复卡片表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 目标账号/邮箱 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">目标账号 / 绑定邮箱</label>
            <input
              type="text"
              required
              value={accountInput}
              onChange={(e) => { setAccountInput(e.target.value); setErrorMsg(''); }}
              placeholder="需要重置密码的账号或邮箱"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>

          {/* 安全恢复密钥 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">安全恢复密钥</label>
              <span className="text-[10px] text-slate-500 font-mono">默认密钥: RECOVERY-2026-KEY</span>
            </div>
            <input
              type="text"
              required
              value={recoveryKey}
              onChange={(e) => { setRecoveryKey(e.target.value); setErrorMsg(''); }}
              placeholder="输入安全恢复密钥 (RECOVERY-2026-KEY)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* 重置新密码 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">设置新密码</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">确认新密码</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* 报错与成功提示信息 */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-600/20 text-xs transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? '正在验证并重置...' : '强制重置密码'}
          </button>
        </form>

        {/* 底部按键 */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
