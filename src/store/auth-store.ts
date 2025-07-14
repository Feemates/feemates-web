import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserDetails = {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  mobile?: string | null;
  is_kyc_verified: boolean;
  is_otp_verified?: boolean;
  avatar?: string | null;
  google_id?: string | null;
  email_verified_at?: string | null;
  status: 'active' | 'inactive' | string;
  refresh_token?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  roles?: string[]; // Keep this for backward compatibility with login/signup
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
