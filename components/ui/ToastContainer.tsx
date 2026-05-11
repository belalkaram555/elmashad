
import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle className="text-accentGreen" size={18} />,
    error: <XCircle className="text-red-500" size={18} />,
    warning: <AlertCircle className="text-primary" size={18} />,
    info: <Info className="text-accentBlue" size={18} />,
  };

  const bgColors = {
    success: 'border-accentGreen/20 bg-accentGreen/5',
    error: 'border-red-500/20 bg-red-500/5',
    warning: 'border-primary/20 bg-primary/5',
    info: 'border-accentBlue/20 bg-accentBlue/5',
  };

  return (
    <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-toast-in min-w-[280px] ${bgColors[toast.type]}`}
        >
          <div className="shrink-0">{icons[toast.type]}</div>
          <p className="flex-1 text-xs font-black text-white">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-secondary hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
