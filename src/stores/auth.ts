import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
    clear: () => set({ accessToken: null }),
}));
