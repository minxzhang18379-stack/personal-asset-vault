import React, { useState } from 'react';
import { AssetProvider, useAssets } from './context/AssetContext';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import ConsumablesTracker from './components/ConsumablesTracker';
import LocationManager from './components/LocationManager';
import AnalyticsView from './components/AnalyticsView';
import AssetDetailModal from './components/AssetDetailModal';
import AssetFormModal from './components/AssetFormModal';
import SettingsModal from './components/SettingsModal';
import UserSecurityModal from './components/UserSecurityModal';
import AuditLogModal from './components/AuditLogModal';
import PasswordRecoveryModal from './components/PasswordRecoveryModal';
import { 
  LayoutDashboard, Package, Box, MapPin, BarChart3, 
  Settings, Lock, Search, ShieldCheck, Diamond, Sparkles, LogOut, Menu, X, AlertCircle, User, ShieldAlert, LogIn, RefreshCw 
} from 'lucide-react';

function MainAppContent() {
  const { 
    activeTab, setActiveTab, setIsSettingsOpen, 
    isSecurityModalOpen, setIsSecurityModalOpen,
    isAuditLogOpen, setIsAuditLogOpen,
    isRecoveryOpen, setIsRecoveryOpen,
    isAuthenticated, login, logout, stats, currentUser 
  } = useAssets();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const success = await login(usernameInput, passwordInput);
    if (!success) {
      setAuthError('用户名或守护密码校验失败，请重新检查输入');
      setPasswordInput('');
    }
  };

  const NAV_ITEMS = [
    { key: 'dashboard', label: '财务大盘', icon: LayoutDashboard },
    { key: 'assets', label: '资产档案', icon: Box, badge: stats?.assetCount || 0 },
    { key: 'consumables', label: '快消耗材', icon: Package, badge: stats?.consumableCount || 0 },
    { key: 'locations', label: '空间收纳', icon: MapPin },
    { key: 'analytics', label: '财务分析', icon: BarChart3 },
  ];

  return (
    <>
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
          <div className={`glass-panel w-full max-w-md p-8 rounded-3xl border space-y-6 text-center shadow-2xl transition-all ${
            authError ? 'border-rose-500/60 bg-rose-950/10 animate-shake' : 'border-slate-800'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto glow-animation">
              <Diamond className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Asset Vault</h1>
              <p className="text-xs text-slate-400 mt-1">资产管理系统</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              {/* 用户名输入框 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  账号 / 邮箱
                </label>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={usernameInput}
                  onChange={e => {
                    setUsernameInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder=""
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                />
              </div>

              {/* 访问密码输入框 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  密码
                </label>
                <input
                  type="password"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder=""
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none transition-colors ${
                    authError ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                登录
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-xs text-slate-400 hover:text-cyan-300 underline font-medium transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row text-slate-100">
          {/* 移动端 Top 栏 */}
          <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Diamond className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">Asset Vault</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="系统设置"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 侧边栏 */}
          <aside className={`
            fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950/95 md:bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-xl md:backdrop-blur-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center glow-animation">
                  <Diamond className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-black text-base text-white tracking-tight">Asset Vault</h1>
                  <p className="text-[10px] text-slate-400 font-medium">资产管理系统</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">总净资产</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">已同步</span>
                </div>
                <div className="text-xl font-black text-white tracking-tight font-mono">
                  ¥ {(stats?.totalValuation || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>系统设置</span>
              </button>

              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>账号与密码</span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          </aside>

          {/* 右侧主内容区域 */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'assets' && <AssetList />}
            {activeTab === 'consumables' && <ConsumablesTracker />}
            {activeTab === 'locations' && <LocationManager />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </main>
        </div>
      )}

      {/* 全局弹窗 Mount 点 (独立放置于根，绝不受 CSS layout/form 影响) */}
      <AssetDetailModal />
      <AssetFormModal />
      <SettingsModal />
      <UserSecurityModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)} 
      />
      <AuditLogModal 
        isOpen={isAuditLogOpen} 
        onClose={() => setIsAuditLogOpen(false)} 
      />
      <PasswordRecoveryModal 
        isOpen={isRecoveryOpen} 
        onClose={() => setIsRecoveryOpen(false)} 
      />
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md border border-rose-500/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-rose-400 font-bold text-base">渲染异常</div>
            <p className="text-xs text-slate-400 font-mono">{this.state.error?.toString()}</p>
            <button
              onClick={this.handleReset}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AssetProvider>
        <MainAppContent />
      </AssetProvider>
    </ErrorBoundary>
  );
}
