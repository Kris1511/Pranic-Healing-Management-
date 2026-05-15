import { useIonToast } from '@ionic/react';
import { useCallback } from 'react';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const useToast = () => {
  const [present] = useIonToast();

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      present({
        message,
        duration: options.duration || 2000,
        position: options.position || 'bottom',
        color: options.color || 'primary',
      });
    },
    [present]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { color: 'success', duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { color: 'danger', duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { color: 'warning', duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { color: 'primary', duration });
    },
    [showToast]
  );

  return {
    show: showToast,
    success,
    error,
    warning,
    info,
  };
};
