
import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  show,
  onClose,
  type = 'error',
  duration = 5000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) {
    return null;
  }

  const baseClasses = "fixed bottom-5 right-5 md:bottom-10 md:right-10 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-all duration-300 ease-in-out";
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-600",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <span className="mr-3">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          aria-label="Close notification"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
