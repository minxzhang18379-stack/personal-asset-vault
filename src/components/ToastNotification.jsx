import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all duration-300
        ${isError 
          ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-500/10' 
          : isWarning 
            ? 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-500/10' 
            : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/40 shadow-cyan-500/10'}
      `}>
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : isWarning ? (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
        )}
        <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
