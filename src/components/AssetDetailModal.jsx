import React, { useState, useEffect } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  X, MapPin, Calendar, ShieldCheck, Tag, FileText, 
  DollarSign, Clock, ExternalLink, Image as ImageIcon, CheckCircle, Edit3, TrendingDown, Flame
} from 'lucide-react';
import { calculateDailyCost } from '../utils/costCalculator';

export default function AssetDetailModal() {
  const { detailAsset, setDetailAsset, setEditingAsset, locations } = useAssets();
  const [activePhoto, setActivePhoto] = useState(0);

  // ESC 键快捷关闭 Modal 监听
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && detailAsset) {
        setDetailAsset(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailAsset, setDetailAsset]);

  if (!detailAsset) return null;

  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : '未绑定位置';
  };

  const photos = detailAsset.attachments || [];
  const pPrice = Number(detailAsset.purchase_price) || 0;
  const cValue = Number(detailAsset.current_value) || 0;
  const depAmount = Math.max(0, pPrice - cValue);
  const depPercent = pPrice ? ((depAmount / pPrice) * 100).toFixed(1) : 0;

  // 每日使用成本计算
  const dailyMetrics = calculateDailyCost(detailAsset.purchase_price, detailAsset.purchase_date, detailAsset.current_value);

  return (
    <div 
      onClick={() => setDetailAsset(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700/60"
      >
        {/* 顶部标题与关闭 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {detailAsset.category}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">{detailAsset.name}</h2>
          </div>
          <button
            onClick={() => setDetailAsset(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容滚轮体 */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 照片画廊展示 */}
          {photos.length > 0 ? (
            <div className="space-y-3">
              <div className="h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                <img
                  src={photos[activePhoto]?.url}
                  alt={photos[activePhoto]?.title || detailAsset.name}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-700">
                  {photos[activePhoto]?.title || '凭证/照'} ({activePhoto + 1}/{photos.length})
                </span>
              </div>
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activePhoto === idx ? 'border-cyan-400 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-32 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
              <ImageIcon className="w-8 h-8 opacity-60" />
              <span className="text-xs">暂无上传实物照片或发票凭证</span>
            </div>
          )}

          {/* 🔥 核心新增：每日使用成本 (Daily Cost of Use) 计算大卡 */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Flame className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                每日平均持用成本 (Daily Cost of Use)
              </div>
              <span className="text-xs text-slate-400 font-mono">
                已持用使用 <span className="font-extrabold text-white">{dailyMetrics.daysOwned}</span> 天
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">每日采购均摊成本 (原价÷持用天数)</div>
                <div className="text-lg font-extrabold text-amber-300 mt-0.5 font-mono">
                  {dailyMetrics.formattedGross}
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">每日净折旧耗损成本 (折旧额÷持用天数)</div>
                <div className="text-lg font-extrabold text-rose-300 mt-0.5 font-mono">
                  {dailyMetrics.formattedNet}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 自 <span className="font-mono text-slate-200">{detailAsset.purchase_date || '购入之日'}</span> 购入至今，平均每天的使用成本为 <span className="font-bold text-amber-300 font-mono">{dailyMetrics.formattedGross}</span>。用得越久，每日均摊费用越低！
            </p>
          </div>

          {/* 价值与折旧数据汇总 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">购买原价</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">¥ {pPrice.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
              <div className="text-xs text-cyan-300">当前计算估值</div>
              <div className="text-xl font-extrabold text-cyan-300 mt-1 font-mono">¥ {cValue.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
              <div className="text-xs text-purple-300">累计计算折旧</div>
              <div className="text-xl font-bold text-purple-300 mt-1 font-mono">¥ {depAmount.toLocaleString()} ({depPercent}%)</div>
            </div>
          </div>

          {/* 详细参数规格表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-cyan-400" />
                存放位置与档案
              </div>
              <div className="font-medium text-white">{getLocationName(detailAsset.location_id)}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>状态：</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 在用使用中
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                保修与购入节点
              </div>
              <div className="text-xs text-slate-300">购买日期：<span className="font-mono text-slate-200">{detailAsset.purchase_date || '未记录'}</span></div>
              <div className="text-xs text-slate-300">保修截止：
                <span className="text-amber-400 font-semibold font-mono ml-1">{detailAsset.warranty_expire_date || '无保修/未记录'}</span>
              </div>
            </div>
          </div>

          {/* 品牌、序列号与备注 */}
          {(detailAsset.brand || detailAsset.serial_number || detailAsset.notes) && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              {detailAsset.brand && <div className="text-xs text-slate-400">品牌 / 型号：<span className="text-slate-200">{detailAsset.brand} {detailAsset.model_number}</span></div>}
              {detailAsset.serial_number && <div className="text-xs text-slate-400">序列号/VIN：<span className="font-mono text-cyan-300">{detailAsset.serial_number}</span></div>}
              {detailAsset.notes && <div className="text-xs text-slate-300 mt-2 border-t border-slate-800 pt-2 font-sans">{detailAsset.notes}</div>}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={() => {
              const current = detailAsset;
              setDetailAsset(null);
              setEditingAsset(current);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4" /> 编辑该资产
          </button>
          <button
            onClick={() => setDetailAsset(null)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
}
