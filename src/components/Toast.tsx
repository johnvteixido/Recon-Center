import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Info, AlertCircle, CheckCircle, Zap } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToastProps {
  message: string;
  type?: 'info' | 'error' | 'success' | 'pulse';
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    success: <CheckCircle className="w-4 h-4 text-green-400" />,
    pulse: <Zap className="w-4 h-4 text-purple-400" fill="currentColor" />,
  };

  const colors = {
    info: "border-blue-500/20 bg-blue-500/5 text-blue-100",
    error: "border-red-500/20 bg-red-500/5 text-red-100",
    success: "border-green-500/20 bg-green-500/5 text-green-100",
    pulse: "border-purple-500/20 bg-purple-500/5 text-purple-100",
  };

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-[100] flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-fadeIn",
      colors[type]
    )}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Tactical Comms</span>
        <span className="text-xs font-bold leading-tight">{message}</span>
      </div>
    </div>
  );
};
