import React, { useState, useEffect } from 'react';
import { useAssets } from '../context/AssetContext';
import { 
  X, Upload, Plus, Trash2, Image as ImageIcon,
  Smartphone, Tablet, Laptop, Monitor, Tv, Gamepad2, Headphones, Speaker, Camera, Watch, Cpu, HardDrive, Printer, Wifi,
  Car, Bike, Plane, Ship, Fuel,
  Home, Bed, Sofa, Lamp, Coffee, Utensils, Wine, Shirt, Scissors,
  Gem, Sparkles, Crown, Briefcase, Glasses, Tag,
  Box, Key, ShieldCheck, CreditCard
} from 'lucide-react';
import CustomSelect from './CustomSelect';

const ICON_OPTIONS = [
  // 数码电子
  { key: 'Smartphone', label: 'iPhone', icon: Smartphone },
  { key: 'Tablet', label: 'iPad', icon: Tablet },
  { key: 'Laptop', label: 'MacBook', icon: Laptop },
  { key: 'Monitor', label: '显示器', icon: Monitor },
  { key: 'Tv', label: '电视影音', icon: Tv },
  { key: 'Gamepad2', label: '游戏机', icon: Gamepad2 },
  { key: 'Headphones', label: '耳机', icon: Headphones },
  { key: 'Speaker', label: '音响设备', icon: Speaker },
  { key: 'Camera', label: '摄影仪器', icon: Camera },
  { key: 'Watch', label: 'AppleWatch', icon: Watch },
  { key: 'Cpu', label: '主机芯片', icon: Cpu },
  { key: 'HardDrive', label: '移动存储', icon: HardDrive },
  { key: 'Printer', label: '打印设备', icon: Printer },
  { key: 'Wifi', label: '网络设备', icon: Wifi },

  // 出行交通
  { key: 'Car', label: '汽车座驾', icon: Car },
  { key: 'Bike', label: '骑行车具', icon: Bike },
  { key: 'Plane', label: '航空航模', icon: Plane },
  { key: 'Ship', label: '游艇水上', icon: Ship },
  { key: 'Fuel', label: '能源油卡', icon: Fuel },

  // 家居生活
  { key: 'Home', label: '房产不动产', icon: Home },
  { key: 'Bed', label: '寝具床品', icon: Bed },
  { key: 'Sofa', label: '家具整装', icon: Sofa },
  { key: 'Lamp', label: '灯具照明', icon: Lamp },
  { key: 'Coffee', label: '咖啡饮品', icon: Coffee },
  { key: 'Utensils', label: '厨具餐具', icon: Utensils },
  { key: 'Wine', label: '名酒酒藏', icon: Wine },
  { key: 'Shirt', label: '服饰鞋包', icon: Shirt },
  { key: 'Scissors', label: '美容护理', icon: Scissors },

  // 奢品收藏
  { key: 'Gem', label: '珠宝首饰', icon: Gem },
  { key: 'Sparkles', label: '奢侈名品', icon: Sparkles },
  { key: 'Crown', label: '艺术藏品', icon: Crown },
  { key: 'Briefcase', label: '皮具公文', icon: Briefcase },
  { key: 'Glasses', label: '眼镜饰品', icon: Glasses },
  { key: 'Tag', label: '名牌潮品', icon: Tag },

  // 箱包与防护
  { key: 'Box', label: '通用收纳', icon: Box },
  { key: 'Key', label: '密匣钥匙', icon: Key },
  { key: 'ShieldCheck', label: '保险保单', icon: ShieldCheck },
  { key: 'CreditCard', label: '卡卷资产', icon: CreditCard }
];

export default function AssetFormModal() {
  const { editingAsset, setEditingAsset, handleSaveAsset, locations, categories, handleAddCategory, handleSaveLocation } = useAssets();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '电子产品',
    icon: '',
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    warranty_expire_date: '',
    location_id: '',
    brand: '',
    model_number: '',
    serial_number: '',
    notes: '',
    attachments: []
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  // ESC 键快捷关闭 Modal 监听
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && editingAsset) {
        setEditingAsset(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingAsset, setEditingAsset]);

  useEffect(() => {
    if (editingAsset && editingAsset.id) {
      setFormData({
        ...editingAsset,
        icon: editingAsset.icon || '',
        purchase_price: editingAsset.purchase_price || '',
        current_value: editingAsset.current_value || '',
        purchase_date: editingAsset.purchase_date || '',
        warranty_expire_date: editingAsset.warranty_expire_date || '',
        attachments: editingAsset.attachments || []
      });
    } else {
      setFormData({
        name: '',
        category: categories[0] || '电子产品',
        icon: '',
        purchase_price: '',
        current_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expire_date: '',
        location_id: locations[0]?.id || 'loc-1',
        brand: '',
        model_number: '',
        serial_number: '',
        notes: '',
        attachments: []
      });
    }
  }, [editingAsset, locations, categories]);

  if (!editingAsset) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('请输入资产名称');
    
    handleSaveAsset({
      ...formData,
      purchase_price: Number(formData.purchase_price) || 0,
      current_value: Number(formData.current_value) || Number(formData.purchase_price) || 0
    });
  };

  const addImageFromUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, { id: 'att-' + Date.now(), type: 'photo', url: imageUrlInput.trim(), title: '网络照片' }]
    }));
    setImageUrlInput('');
  };

  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id)
    }));
  };

  return (
    <div 
      onClick={() => setEditingAsset(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700/60"
      >
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h2 className="text-base font-bold text-white">
            {editingAsset.id ? '编辑资产' : '新增资产'}
          </h2>
          <button
            onClick={() => setEditingAsset(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单主体 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">资产名称 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder=""
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 资产图标选择器 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">资产图标</label>
            </div>
            <div className="grid grid-cols-7 gap-2 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
              {ICON_OPTIONS.map(opt => {
                const IconComp = opt.icon;
                const isSelected = formData.icon === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: isSelected ? '' : opt.key })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-105 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                    title={opt.label}
                  >
                    <IconComp className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] truncate w-full text-center">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">资产大类</label>
              <CustomSelect
                value={formData.category}
                onChange={val => setFormData({ ...formData, category: val })}
                options={categories}
                onAddNewOption={handleAddCategory}
                addNewText="添加新资产大类"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">存放位置</label>
              <CustomSelect
                value={formData.location_id}
                onChange={val => setFormData({ ...formData, location_id: val })}
                options={locations.map(l => ({ value: l.id, label: l.name }))}
                onAddNewOption={(newLocName) => {
                  handleSaveLocation({ name: newLocName, description: '快捷添加空间', icon: 'Package' });
                }}
                addNewText="新建存放位置"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">购买原价 (¥)</label>
              <input
                type="number"
                value={formData.purchase_price}
                onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="购买时的费用"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">当前估计残值 (¥)</label>
              <input
                type="number"
                value={formData.current_value}
                onChange={e => setFormData({ ...formData, current_value: e.target.value })}
                placeholder="留空自动按折旧率计算"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">购买日期</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">保修截止日期</label>
              <input
                type="date"
                value={formData.warranty_expire_date}
                onChange={e => setFormData({ ...formData, warranty_expire_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="如 Apple"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">型号</label>
              <input
                type="text"
                value={formData.model_number}
                onChange={e => setFormData({ ...formData, model_number: e.target.value })}
                placeholder="如 A2991"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">序列号 / VIN</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="S/N 编号"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* 实物图与凭证附件管理 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">实物照片 / 发票凭证</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                placeholder="输入图片 URL (如 Unsplash / R2 绑定地址)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={addImageFromUrl}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-medium"
              >
                添加链接
              </button>
            </div>

            {formData.attachments.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {formData.attachments.map(att => (
                  <div key={att.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 group">
                    <img src={att.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">备注说明</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录买卖信息、扩展保修政策或特有属性..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 提交与取消按钮 */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingAsset(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/20"
            >
              保存资产记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
