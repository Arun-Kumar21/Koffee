import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

type CredentialsType = {
  isEmail: boolean;
  password: string;
  loginField: string;
};

type UserType = {
  id: string;
  name: string;
  email: string;
  // Add other user properties if necessary
};

type AuthStoreType = {
  user: UserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: UserType | null) => void;
  login: (credentials: CredentialsType) => Promise<void>;
  logout: () => void;
};

const useAuthStore = create<AuthStoreType>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Login action with more specific typing
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const response = await axios.post("/api/login", credentials);
          const user = response.data;
          set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            loading: false,
          });
        }
      },

      // Logout action
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
