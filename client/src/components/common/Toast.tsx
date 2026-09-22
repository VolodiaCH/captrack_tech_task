import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' },
    error: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' },
    info: { bg: '#e0f2fe', border: '#bae6fd', text: '#0c4a6e' },
  };

  const color = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--spacing-lg)',
        right: 'var(--spacing-lg)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 'var(--radius)',
        color: color.text,
        boxShadow: 'var(--shadow-md)',
        maxWidth: '400px',
        zIndex: 2000,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    setToast({ message, type, duration });
  };

  const showError = (message: string) => showToast(message, 'error');
  const showSuccess = (message: string) => showToast(message, 'success');
  const showInfo = (message: string) => showToast(message, 'info');

  return {
    toast,
    showToast,
    showError,
    showSuccess,
    showInfo,
    clearToast: () => setToast(null),
  };
}
