import React, { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  X, ShieldCheck, KeyRound, User, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Sparkles, UserCheck, Shield, Key
} from 'lucide-react';

export default function UserSecurityModal({ isOpen, onClose }) {
  const { masterPasswordHash, handleChangePassword, currentUser, handleUpdateUser, showToast } = useAssets();

  // 密码修改表单状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 账户资料编辑状态
  const [userName, setUserName] = useState(currentUser?.name || 'Minx Zhang');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'minxzhang18379@gmail.com');
  const [userRole, setUserRole] = useState(currentUser?.role || 'master');

  if (!isOpen) return null;

  // 密码强度评级计算
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '无', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: '弱 (建议增加长度)', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 3) return { score: 60, label: '中等 (安全性可)', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 100, label: '强 (高强度防护)', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(newPassword);

  // 提交修改密码
  const onSubmitPassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('两次输入的新密码不一致，请重新检查');
      return;
    }

    try {
      await handleChangePassword(oldPassword, newPassword);
      setPassSuccess('密码已成功重置修改！全站 SHA-256 加密即刻生效。');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) showToast('主守护密码已成功修改 (SHA-256 加密)', 'success');
    } catch (err) {
      setPassError(err.message || '密码修改失败');
    }
  };

  // 提交更新账号资料与角色
  const onSubmitProfile = (e) => {
    e.preventDefault();
    let roleName = '主超级管理员';
    if (userRole === 'family') roleName = '家庭共享成员';
    if (userRole === 'guest') roleName = '只读访客模式';

    handleUpdateUser({
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
      roleName
    });

    if (showToast) showToast('账户资料与角色已更新', 'success');
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col max-h-[90vh]"
      >
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">用户与安全密码管理</h2>
              <p className="text-xs text-slate-400">管理金库访问守护密码、账户角色与多成员权限</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容主体 */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 模块 1: 当前登录成员身份与角色设定 */}
          <form onSubmit={onSubmitProfile} className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              当前账户个人资料与角色权限
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              {/* 用户名与邮箱绑定指示器 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  账号与邮箱绑定状态：
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {userName || 'Minx Zhang'} &lt;{userEmail || 'minxzhang18379@gmail.com'}&gt; 已双向关联绑定
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">用户姓名 / 登录账号</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">关联绑定的邮箱账号</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">家庭与资产安全角色</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="master">👑 主超级管理员 (全权读写、修改与数据彻底清空权限)</option>
                  <option value="family">🏡 家庭共享成员 (可新增与编辑，无彻底清空或全库导出权限)</option>
                  <option value="guest">👁️ 只读访客模式 (仅支持查看资产与财务概览)</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  保存个人资料与角色
                </button>
              </div>
            </div>
          </form>

          {/* 模块 2: 修改主守护密码 (Master Lock Password) */}
          <form onSubmit={onSubmitPassword} className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              修改金库主守护密码
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              {/* 旧密码 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">当前原守护密码</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="输入当前原守护密码"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 新密码与二次确认 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">设置新密码</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="建议 6 位以上混合字符"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">再次确认新密码</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="重复输入新密码"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 密码强度可视化刻度条 */}
              {newPassword && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">密码安全强度强度评估：</span>
                    <span className={`font-extrabold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${strength.score}%` }} 
                    />
                  </div>
                </div>
              )}

              {/* 报错与成功提示信息 */}
              {passError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  {passSuccess}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                >
                  确定更新主守护密码
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
}
