import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const storage: PersistStorage<AuthState> = {
  getItem: (name): StorageValue<AuthState> | null => {
    const str = Cookies.get(name);
    if (!str) return null;
    try {
      const obj = JSON.parse(decodeURIComponent(str));
      return obj as StorageValue<AuthState>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    Cookies.set(name, JSON.stringify(value), {
      expires: 7,
      path: '/',
      sameSite: 'lax',
    });
  },
  removeItem: (name) => Cookies.remove(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage,
    }
  )
);
