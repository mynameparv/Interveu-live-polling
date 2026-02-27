import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import clsx from 'clsx';
import { XCircle, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white max-w-sm animate-slide-up cursor-pointer',
                            {
                                'bg-red-500': toast.type === 'error',
                                'bg-green-500': toast.type === 'success',
                                'bg-blue-500': toast.type === 'info',
                            }
                        )}
                        onClick={() => removeToast(toast.id)}
                    >
                        {toast.type === 'error' && <XCircle size={20} />}
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}
                        <p className="font-medium text-sm">{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
