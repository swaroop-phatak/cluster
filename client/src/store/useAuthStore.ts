import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  refreshTokenVersion: number;
  emailAlertsEnabled: boolean;
  minScoreThreshold: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  clearUser: () => set({ user: null, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
}));