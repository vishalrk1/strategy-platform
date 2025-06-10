"use client";

import { FyersFundsLimit, FyresResponse } from "@/types/fyres/types";
import { User } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearInvalidFyersTokens, isFyersAuthError } from "@/lib/fyersApi";
import { useAuthStore } from "./authStore";

interface FyersState {
  clientId: string | null;
  secretKey: string | null;
  authCode: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthorized: boolean;
  fund_limit: FyersFundsLimit[];
  verificationStatus:
    | "checking"
    | "requires_credentials"
    | "requires_auth"
    | "auth_started"
    | "auth_completed"
    | "success"
    | "failed";

  // Actions
  setCredentials: (clientId: string, secretKey: string) => void;
  setAuthCode: (authCode: string) => void;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setFyersStoreData: (user: User) => void;
  getFundsLimit: () => Promise<void>;
  setVerificationStatus: (status: FyersState["verificationStatus"]) => void;
  clearFyersData: () => void;
  updateFromBackend: (data: any) => void;
  initialize: () => void;
}

export const useFyersStore = create<FyersState>()(
  persist(
    (set, get) => ({
      clientId: null,
      secretKey: null,
      authCode: null,
      accessToken: null,
      refreshToken: null,
      isAuthorized: false,
      fund_limit: [],
      verificationStatus: "checking",

      setCredentials: (clientId, secretKey) => {
        set({
          clientId,
          secretKey,
          verificationStatus: "requires_auth",
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("fyers_client_id", clientId);
          localStorage.setItem("fyers_secret_key", secretKey);
        }
      },

      setFyersStoreData: (user) => {
        if (user) {
          set({
            clientId: user.fyersClientId || null,
            secretKey: user.fyersSecretKey || null,
            authCode: user.fyersAuthCode || null,
            accessToken: user.fyersAccessToken || null,
            refreshToken: user.fyersRefreshToken || null,
            isAuthorized: !!user.fyersAccessToken,
            verificationStatus: user.fyersAccessToken
              ? "success"
              : user.fyersClientId && user.fyersSecretKey
              ? "requires_auth"
              : "requires_credentials",
          });
        }
      },

      getFundsLimit: async () => {
        try {
          console.log(get().clientId, get().accessToken);
          if (!get().clientId || !get().accessToken) {
            console.warn("Client ID or access token is not set.");
            set({
                accessToken: null,
                authCode: null,
                refreshToken: null,
                isAuthorized: false,
                verificationStatus:
                  get().clientId && get().secretKey
                    ? "requires_auth"
                    : "requires_credentials",
                fund_limit: [],
              });
            return;
          }

          const fundsResponse = await fetch(
            "https://api-t1.fyers.in/api/v3/funds",
            {
              method: "GET",
              headers: {
                Authorization: `${get().clientId}:${get().accessToken}`,
              },
            }
          );

          const fundsResult: FyresResponse = await fundsResponse.json();
          if (isFyersAuthError(fundsResult)) {
            console.log(
              "Token invalid, clearing tokens from database and local storage"
            );
            const result = await clearInvalidFyersTokens();
            if (result.success && result.user) {
              useAuthStore.getState().setUser(result.user);
            } else {
              set({
                accessToken: null,
                authCode: null,
                refreshToken: null,
                isAuthorized: false,
                verificationStatus:
                  get().clientId && get().secretKey
                    ? "requires_auth"
                    : "requires_credentials",
                fund_limit: [],
              });
              if (typeof window !== "undefined") {
                localStorage.removeItem("fyers_access_token");
                localStorage.removeItem("fyers_auth_code");
                localStorage.removeItem("fyers_refresh_token");
              }
            }
            return;
          }

          if (fundsResult.code === 200 && fundsResult.s === "ok") {
            set({ fund_limit: fundsResult.fund_limit });
          }
        } catch (error) {
          console.error("Error fetching Fyers funds limit:", error);
          set({
            fund_limit: [],
            verificationStatus: "failed",
          });
        }
      },

      setAuthCode: (authCode) => {
        set({
          authCode,
          isAuthorized: !!authCode,
          verificationStatus: authCode ? "auth_completed" : "requires_auth",
        });

        if (typeof window !== "undefined") {
          if (authCode) {
            localStorage.setItem("fyers_auth_code", authCode);
          } else {
            localStorage.removeItem("fyers_auth_code");
          }
        }
      },

      setAccessToken: (accessToken) => {
        set({
          accessToken,
          isAuthorized: !!accessToken,
          verificationStatus: accessToken ? "success" : "requires_auth",
        });

        if (typeof window !== "undefined") {
          if (accessToken) {
            localStorage.setItem("fyers_access_token", accessToken);
          } else {
            localStorage.removeItem("fyers_access_token");
          }
        }
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken });

        if (typeof window !== "undefined") {
          if (refreshToken) {
            localStorage.setItem("fyers_refresh_token", refreshToken);
          } else {
            localStorage.removeItem("fyers_refresh_token");
          }
        }
      },

      setVerificationStatus: (verificationStatus) => {
        set({ verificationStatus });
      },

      clearFyersData: () => {
        set({
          clientId: null,
          secretKey: null,
          authCode: null,
          accessToken: null,
          refreshToken: null,
          isAuthorized: false,
          verificationStatus: "requires_credentials",
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("fyers_client_id");
          localStorage.removeItem("fyers_secret_key");
          localStorage.removeItem("fyers_auth_code");
          localStorage.removeItem("fyers_access_token");
          localStorage.removeItem("fyers_refresh_token");
        }
      },

      updateFromBackend: (data) => {
        const updates: Partial<FyersState> = {};

        if (data.fyers_client_id) {
          updates.clientId = data.fyers_client_id;
        }

        if (data.fyers_secret_key) {
          updates.secretKey = data.fyers_secret_key;
        }

        if (data.fyers_access_token) {
          updates.accessToken = data.fyers_access_token;
          updates.isAuthorized = true;
          updates.verificationStatus = "success";
        }

        if (data.fyers_refresh_token) {
          updates.refreshToken = data.fyers_refresh_token;
        }

        if (data.hasOwnProperty("token_valid")) {
          if (!data.token_valid) {
            updates.accessToken = null;
            updates.authCode = null;
            updates.isAuthorized = false;
            updates.verificationStatus =
              data.fyers_client_id && data.fyers_secret_key
                ? "requires_auth"
                : "requires_credentials";
          }
        }

        // Determine verification status
        if (!updates.verificationStatus) {
          if (updates.accessToken) {
            updates.verificationStatus = "success";
            updates.isAuthorized = true;
          } else if (updates.clientId && updates.secretKey) {
            updates.verificationStatus = "requires_auth";
          } else {
            updates.verificationStatus = "requires_credentials";
          }
        }

        set(updates);

        // Sync with localStorage
        if (typeof window !== "undefined") {
          if (updates.clientId)
            localStorage.setItem("fyers_client_id", updates.clientId);
          if (updates.secretKey)
            localStorage.setItem("fyers_secret_key", updates.secretKey);
          if (updates.accessToken) {
            localStorage.setItem("fyers_access_token", updates.accessToken);
          } else if (updates.accessToken === null) {
            localStorage.removeItem("fyers_access_token");
          }
          if (updates.refreshToken) {
            localStorage.setItem("fyers_refresh_token", updates.refreshToken);
          } else if (updates.refreshToken === null) {
            localStorage.removeItem("fyers_refresh_token");
          }
        }
      },

      initialize: () => {
        if (typeof window !== "undefined") {
          const storedClientId = localStorage.getItem("fyers_client_id");
          const storedSecretKey = localStorage.getItem("fyers_secret_key");
          const storedAuthCode = localStorage.getItem("fyers_auth_code");
          const storedAccessToken = localStorage.getItem("fyers_access_token");
          const storedRefreshToken = localStorage.getItem(
            "fyers_refresh_token"
          );

          const updates: Partial<FyersState> = {};

          updates.clientId = storedClientId || null;
          updates.secretKey = storedSecretKey || null;
          updates.authCode = storedAuthCode || null;
          updates.accessToken = storedAccessToken || null;
          updates.refreshToken = storedRefreshToken || null;

          // Determine status and authorization
          if (storedAccessToken) {
            updates.isAuthorized = true;
            updates.verificationStatus = "success";
          } else if (storedAuthCode) {
            updates.isAuthorized = true;
            updates.verificationStatus = "auth_completed";
          } else if (storedClientId && storedSecretKey) {
            updates.verificationStatus = "requires_auth";
          } else {
            updates.verificationStatus = "requires_credentials";
          }

          set(updates);
        }
      },
    }),
    {
      name: "fyers-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clientId: state.clientId,
        secretKey: state.secretKey,
        authCode: state.authCode,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthorized: state.isAuthorized,
        verificationStatus: state.verificationStatus,
      }),
    }
  )
);
