import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserDetails = {
  id: number;
  email: string;
  name: string;
  roles: string[];
  is_kyc_verified?: boolean;
  status?: string;
};

type AuthState = {
  authToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userDetails: UserDetails | null;
  rememberMe: boolean;
};

type AuthActions = {
  setToken: (authToken: string, refreshToken: string) => void;
  clearToken: () => void;
  setUserId: (userId: string) => void;
  setUserDetails: (userDetails: UserDetails) => void;
  setRememberMe: (rememberMe: boolean) => void;
  reset: () => void;
};

const initialState: AuthState = {
  authToken: null,
  refreshToken: null,
  userId: null,
  userDetails: null,
  rememberMe: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      setToken: (authToken, refreshToken) => set({ authToken, refreshToken }),
      clearToken: () => set({ authToken: null, refreshToken: null }),
      setUserId: (userId) => set({ userId }),
      setUserDetails: (userDetails) => set({ userDetails }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
