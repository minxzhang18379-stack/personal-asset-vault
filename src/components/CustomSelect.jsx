import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = '请选择',
  onAddNewOption = null,
  addNewText = '+ 自定义新增类目'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInputValue, setNewInputValue] = useState('');
  const containerRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  const handleConfirmAddNew = () => {
    if (newInputValue.trim() && onAddNewOption) {
      const added = newInputValue.trim();
      onAddNewOption(added);
      if (onChange) onChange(added);
      setNewInputValue('');
      setIsAddingNew(false);
      setIsOpen(false);
    }
  };

  // 寻找选中项的 Label
  const foundOpt = safeOptions.find(o => (typeof o === 'object' ? o.value === value : o === value));
  const selectedLabel = typeof value === 'object' ? value?.label : (typeof foundOpt === 'object' ? foundOpt?.label : foundOpt || value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* 触发选择框外观 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-left text-white text-sm flex items-center justify-between transition-all focus:outline-none focus:border-cyan-500 shadow-inner"
      >
        <span className={value ? 'text-white font-medium' : 'text-slate-500'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* 自定义暗黑系 Glassmorphism 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn py-1">
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
            {safeOptions.map((opt, idx) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = optVal === value;

              return (
                <button
                  key={optVal || idx}
                  type="button"
                  onClick={() => handleSelect(optVal)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{optLabel}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* 新增自定义项选项 */}
          {onAddNewOption && (
            <div className="border-t border-slate-800/80 p-1.5 bg-slate-950/60">
              {isAddingNew ? (
                <div className="flex items-center gap-2 p-1">
                  <input
                    type="text"
                    autoFocus
                    value={newInputValue}
                    onChange={(e) => setNewInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleConfirmAddNew())}
                    placeholder="输入新类目名称..."
                    className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmAddNew}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                  >
                    确定
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addNewText.replace(/^\+\s*/, '')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
