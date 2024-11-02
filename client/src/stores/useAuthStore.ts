import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

// Define types for the user and error
type UserType = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
};

type CredentialsType = {
  isEmail: boolean;
  password: string;
  loginField: string;
};

type AuthState = {
  user: UserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<boolean>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (credentials: CredentialsType) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  clearErrors: () => void;
};

const useAuthStore = create<AuthState>()(
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

      // Check authentication status
      checkAuth: async () => {
        try {
          set({ loading: true, error: null });
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/v1/user/verify`,
            { withCredentials: true }
          );

          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
          });

          return true;
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: error.response?.data?.message || "Authentication failed",
          });
          return false;
        }
      },

      // Register user
      register: async (name, username, email, password, avatar) => {
        try {
          set({ loading: true, error: null });
          await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/v1/user/register`,
            { name, userName: username, email, password, avatar }
          );

          set({ loading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Registration failed";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Login user
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const response = await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/v1/user/login`,
            credentials.isEmail
              ? { email: credentials.loginField, password: credentials.password }
              : { userName: credentials.loginField, password: credentials.password },
            { withCredentials: true }
          );

          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        const user = get().user;

        try {
          set({ loading: true, error: null });
          await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/v1/user/logout`,
            { email: user?.email },
            { withCredentials: true }
          );

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Logout failed";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Clear all errors
      clearErrors: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useAuthStore;
