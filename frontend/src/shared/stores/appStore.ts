import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Theme, Notification } from '../types';

interface AppState {
  theme: Theme;
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
  sidebarOpen: boolean;
}

interface AppActions {
  setTheme: (theme: Theme) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

type AppStore = AppState & AppActions;

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      user: null,
      isLoading: false,
      notifications: [],
      sidebarOpen: true,

      setTheme: (theme) => set({ theme }),
      
      setUser: (user) => set({ user }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substring(2),
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'nexus-core-app-store',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

export default useAppStore;