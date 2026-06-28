import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { X, AlertTriangle, AlertOctagon, CheckCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const config = {
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, color: 'text-emerald-600' },
    error: { bg: 'bg-red-50 border-red-200', icon: AlertOctagon, color: 'text-red-600' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info, color: 'text-blue-600' },
  };

  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <div className={`toast-enter pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${c.bg}`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${c.color}`} />
      <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
