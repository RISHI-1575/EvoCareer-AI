import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

interface AuthStore {
  user: any; accessToken: string|null; refreshToken: string|null; isAuthenticated: boolean;
  login: (email:string, password:string) => Promise<void>;
  register: (email:string, fullName:string, password:string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
      login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const { access_token, refresh_token } = res.data;
        set({ accessToken: access_token, refreshToken: refresh_token, isAuthenticated: true });
        const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${access_token}` } });
        set({ user: me.data });
      },
      register: async (email, fullName, password) => {
        const res = await api.post("/auth/register", { email, full_name: fullName, password });
        const { access_token, refresh_token } = res.data;
        set({ accessToken: access_token, refreshToken: refresh_token, isAuthenticated: true });
        const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${access_token}` } });
        set({ user: me.data });
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "evocareer-auth" }
  )
);