import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now().toString() }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

export const useNotification = () => {
  const { addNotification } = useNotificationStore();

  return {
    success: (message: string, duration?: number) => {
      addNotification({ message, type: 'success', duration });
    },
    error: (message: string, duration?: number) => {
      addNotification({ message, type: 'error', duration });
    },
    warning: (message: string, duration?: number) => {
      addNotification({ message, type: 'warning', duration });
    },
    info: (message: string, duration?: number) => {
      addNotification({ message, type: 'info', duration });
    },
  };
};
