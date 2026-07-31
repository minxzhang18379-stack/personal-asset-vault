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
import { 
  LayoutDashboard, Package, Box, MapPin, BarChart3, 
  Settings, Lock, Search, ShieldCheck, Diamond, Sparkles, LogOut, Menu, X, AlertCircle, User 
} from 'lucide-react';

function MainAppContent() {
  const { 
    activeTab, setActiveTab, setIsSettingsOpen, 
    isSecurityModalOpen, setIsSecurityModalOpen,
    isAuditLogOpen, setIsAuditLogOpen,
    isAuthenticated, login, logout, stats, currentUser 
  } = useAssets();

  const [usernameInput, setUsernameInput] = useState(currentUser?.name || 'Minx Zhang');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const success = await login(usernameInput, passwordInput);
    if (!success) {
      setAuthError('用户名或守护密码校验失败，请重新检查输入 (默认初始密码为 admin)');
      setPasswordInput('');
    }
  };

  // 简单安全关卡登录
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className={`glass-panel w-full max-w-md p-8 rounded-3xl border space-y-6 text-center shadow-2xl transition-all ${
          authError ? 'border-rose-500/60 bg-rose-950/10 animate-shake' : 'border-slate-800'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto glow-animation">
            <Diamond className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Cloudflare Asset Vault</h1>
            <p className="text-xs text-slate-400 mt-2">个人财产与全生命周期资产管理系统</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            {/* 用户名输入框 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                登录账号 / 用户姓名
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={e => {
                  setUsernameInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="用户名，如 Minx Zhang / admin"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium"
              />
            </div>

            {/* 访问守护密码输入框 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                访问守护密码
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="默认密码：admin"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
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
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition-all"
            >
              解锁进入资产金库
            </button>
          </form>
          <div className="text-xs text-slate-500 border-t border-slate-800/80 pt-4">
            托管于 Cloudflare Pages & D1 Database
          </div>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { key: 'dashboard', label: '财务大盘', icon: LayoutDashboard },
    { key: 'assets', label: '资产档案', icon: Box, badge: stats.assetCount },
    { key: 'consumables', label: '快消耗材', icon: Package, badge: stats.consumableCount },
    { key: 'locations', label: '空间收纳', icon: MapPin },
    { key: 'analytics', label: '财务分析', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-100">
      {/* 移动端 TopBar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <Diamond className="w-5 h-5 text-cyan-400" />
          <span>Asset Vault</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 左侧侧边导航栏 Sidebar */}
      <aside className={`
        fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Diamond className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight">Asset Vault</div>
              <div className="text-[10px] text-cyan-400/80 font-mono tracking-wider">CLOUDFLARE HOSTED</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-colors border
                    ${isActive 
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-md shadow-cyan-500/5' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-900 text-slate-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 底部设置与退出栏 */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>系统与云服务配置</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>锁定退出会话</span>
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

      {/* 全局弹窗 Mount 点 */}
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
    </div>
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
            <div className="text-rose-400 font-bold text-lg">页面渲染遇到了意料之外的错误</div>
            <p className="text-xs text-slate-400">{this.state.error?.toString()}</p>
            <button
              onClick={this.handleReset}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-bold"
            >
              清除本地缓存并重新加载
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
