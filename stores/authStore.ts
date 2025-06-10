"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "@/types/user";
import { useFyersStore } from "./fyersStore";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fyersVerificationStatus:
    | "checking"
    | "requires_credentials"
    | "requires_auth"
    | "auth_started"
    | "auth_completed"
    | "success"
    | "failed";

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  verifyToken: (token?: string) => Promise<boolean>;
  clearAuth: () => void;
  initialize: () => Promise<void>;

  // Fyers-specific actions
  updateUserFyersData: (fyersData: Partial<User>) => void;
  setFyersVerificationStatus: (
    status: AuthState["fyersVerificationStatus"]
  ) => void;
  refreshUserFromBackend: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      fyersVerificationStatus: "checking",

      // Actions
      setUser: (user) => {
        if (user) {
          useFyersStore.getState().setFyersStoreData(user);
        }
        set(() => ({
          user,
          isAuthenticated: !!user,
        }));
      },

      setToken: (token) => {
        set({ token });
        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("token", token);
            // Also set cookie for server-side middleware
            document.cookie = `token=${token}; path=/; max-age=${
              30 * 24 * 60 * 60
            }; SameSite=strict`;
          } else {
            localStorage.removeItem("token");
            // Remove cookie
            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Fyers-specific actions
      updateUserFyersData: (fyersData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...fyersData };
          set({ user: updatedUser });

          // Sync with fyersStore to ensure consistency
          const fyersStore = useFyersStore.getState();

          // Only update fyersStore with properties that are actually present in fyersData
          if (fyersData.fyersClientId) {
            fyersStore.setCredentials(
              fyersData.fyersClientId,
              fyersData.fyersSecretKey || currentUser.fyersSecretKey || ""
            );
          }

          if (fyersData.fyersAuthCode) {
            fyersStore.setAuthCode(fyersData.fyersAuthCode);
          }

          if (fyersData.fyersAccessToken) {
            fyersStore.setAccessToken(fyersData.fyersAccessToken);
          }

          if (fyersData.fyersRefreshToken) {
            fyersStore.setRefreshToken(fyersData.fyersRefreshToken);
          }
        }
      },

      setFyersVerificationStatus: (fyersVerificationStatus) => {
        set({ fyersVerificationStatus });
      },

      refreshUserFromBackend: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              set({ user: data.user });
            }
          }
        } catch (error) {
          console.error("Error refreshing user from backend:", error);
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          const data: AuthResponse = await response.json();

          if (data.success && data.user && data.token) {
            get().setUser(data.user);
            get().setToken(data.token);
            set({ isAuthenticated: true });
          }

          return data;
        } catch (error) {
          console.error("Login failed:", error);
          return {
            success: false,
            message: "Login failed. Please try again.",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          const data: AuthResponse = await response.json();
          return data;
        } catch (error) {
          console.error("Registration failed:", error);
          return {
            success: false,
            message: "Registration failed. Please try again.",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().clearAuth();
        // Also clear Fyers data on logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("fyers_client_id");
          localStorage.removeItem("fyers_secret_key");
          localStorage.removeItem("fyers_auth_code");
          localStorage.removeItem("fyers_access_token");
        }
      },

      verifyToken: async (token) => {
        const tokenToVerify = token || get().token;
        if (!tokenToVerify) {
          set({ isLoading: false, isAuthenticated: false });
          return false;
        }

        try {
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${tokenToVerify}`,
            },
          });

          const data = await response.json();

          // Check if the response indicates the user is not verified
          if (!data.success && data.message?.includes("not verified")) {
            get().setUser(data.user || null);
            get().setToken(tokenToVerify);
            set({ isAuthenticated: false });
            return false;
          } else if (data.success && data.user) {
            get().setUser(data.user);
            get().setToken(tokenToVerify);
            set({ isAuthenticated: true });
            return true;
          } else {
            get().clearAuth();
            return false;
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          get().clearAuth();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },

      initialize: async () => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) {
            await get().verifyToken(token);
          } else {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        fyersVerificationStatus: state.fyersVerificationStatus,
      }),
    }
  )
);
