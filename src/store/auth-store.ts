import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  authToken: string | null;
  refreshToken: string | null;
  userId: string | null;
};

type AuthActions = {
  setToken: (authToken: string, refreshToken: string) => void;
  clearToken: () => void;
  setUserId: (userId: string) => void;
  reset: () => void;
};

const initialState: AuthState = {
  authToken: null,
  refreshToken: null,
  userId: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      setToken: (authToken, refreshToken) => set({ authToken, refreshToken }),
      clearToken: () => set({ authToken: null, refreshToken: null }),
      setUserId: (userId) => set({ userId }),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
