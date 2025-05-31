"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types/user";
import { FyersCredentialsForm } from "@/components/FyersCredentialsForm";
import {
  generateAuthCodeURL,
  updateFyersToken,
  getFyersData,
  validateFyersToken,
  encodeSecureData,
} from "@/lib/fyersApi";

export default function FyersVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isAuthenticated,
    initialize,
    fyersVerificationStatus,
    setFyersVerificationStatus,
    updateUserFyersData,
    refreshUserFromBackend,
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasCredentialsNotVerified, setHasCredentialsNotVerified] =
    useState(false);

  useEffect(() => {
    const initializeStores = async () => {
      await initialize();
    };
    initializeStores();
  }, [initialize]);
  const updateFyersTokenInBackend = useCallback(
    async (authCode: string) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login again.");
          router.push("/login");
          return;
        }

        const response = await updateFyersToken(token, authCode);

        if (response.tokenExchangeError) {
          console.error("Token exchange failed:", response.tokenExchangeError);
          localStorage.removeItem("fyers_auth_code");
          setFyersVerificationStatus("failed");
          setError(`Token exchange failed: ${response.tokenExchangeError}`);
          return;
        }

        if (!response.tokenValid || !response.accessToken) {
          localStorage.removeItem("fyers_auth_code");
          setFyersVerificationStatus("requires_auth");

          const errorMessage =
            response.message ||
            "Failed to obtain access token. Please try authenticating again.";
          setError(errorMessage);
          return;
        }

        updateUserFyersData({
          fyersAccessToken: response.accessToken,
          fyersRefreshToken: response.refreshToken || undefined,
        });

        setError("");
        setFyersVerificationStatus("success");

        await refreshUserFromBackend();

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Error updating Fyers token:", err);
        localStorage.removeItem("fyers_auth_code");
        setError(
          "Network error occurred while updating Fyers token. Please try again."
        );
        setFyersVerificationStatus("failed");
      } finally {
        setLoading(false);
      }
    },
    [
      setFyersVerificationStatus,
      updateUserFyersData,
      refreshUserFromBackend,
      router,
    ]
  );

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const validationResult = await validateFyersToken(token);

      if (!validationResult.tokenValid) {
        localStorage.removeItem("fyers_auth_code");
        setFyersVerificationStatus("requires_auth");

        if (validationResult.message) {
          setError(validationResult.message);
        } else {
          setError(
            "Fyers token is invalid or expired. Please re-authenticate."
          );
        }
      } else if (validationResult.accessToken) {
        updateUserFyersData({
          fyersAccessToken: validationResult.accessToken,
          fyersRefreshToken: validationResult.refreshToken,
        });
        setFyersVerificationStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err) {
      console.error("Error validating Fyers token:", err);
      setError("Failed to validate Fyers token. Please try again.");
      setFyersVerificationStatus("requires_auth");
    } finally {
      setLoading(false);
    }
  }, [setFyersVerificationStatus, updateUserFyersData, router]);

  const fetchFyersData = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getFyersData(token);
      const updatedData: Partial<User> = {};

      if (data.fyers_client_id) {
        try {
          updatedData.fyersClientId = atob(data.fyers_client_id);
        } catch {
          updatedData.fyersClientId = data.fyers_client_id;
        }
      }
      if (data.fyers_secret_key) {
        try {
          updatedData.fyersSecretKey = atob(data.fyers_secret_key);
        } catch {
          updatedData.fyersSecretKey = data.fyers_secret_key;
        }
      }
      if (data.fyers_access_token) {
        updatedData.fyersAccessToken = data.fyers_access_token;
      }
      if (data.fyers_refresh_token) {
        updatedData.fyersRefreshToken = data.fyers_refresh_token;
      }

      updateUserFyersData(updatedData);

      if (data.hasOwnProperty("token_valid") && !data.token_valid) {
        if (data.fyers_client_id && data.fyers_secret_key) {
          setHasCredentialsNotVerified(true);
          setFyersVerificationStatus("requires_auth");
        } else {
          setFyersVerificationStatus("requires_credentials");
        }

        if (data.message) {
          setError(data.message);
        }
      } else if (data.fyers_client_id && data.fyers_secret_key) {
        if (data.fyers_access_token) {
          setFyersVerificationStatus("success");
          setTimeout(() => router.push("/dashboard"), 1500);
        } else {
          setHasCredentialsNotVerified(true);
          setFyersVerificationStatus("requires_auth");
        }
      } else {
        setFyersVerificationStatus("requires_credentials");
      }
    } catch (err) {
      console.error("Error fetching Fyers credentials:", err);
      setError("Failed to fetch Fyers credentials. Please try again.");
      setFyersVerificationStatus("failed");
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    router,
    setFyersVerificationStatus,
    updateUserFyersData,
  ]);

  const checkExistingAuthorization = useCallback(() => {
    if (user?.fyersAccessToken && user?.fyersClientId) {
      setFyersVerificationStatus("auth_completed");

      const token = localStorage.getItem("token");
      if (token) {
        validateToken();
      } else {
        setLoading(false);
      }
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        fetchFyersData();
      } else {
        router.push("/login");
      }
    }
  }, [user, validateToken, fetchFyersData, router, setFyersVerificationStatus]);

  useEffect(() => {
    const authCode = searchParams.get("auth_code");

    if (authCode) {
      localStorage.setItem("fyers_auth_code", encodeSecureData(authCode));
      setFyersVerificationStatus("auth_completed");

      const token = localStorage.getItem("token");
      if (token) {
        updateFyersTokenInBackend(authCode);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      if (fyersVerificationStatus === "checking") {
        checkExistingAuthorization();
      }
    }
  }, [
    searchParams,
    fyersVerificationStatus,
    updateFyersTokenInBackend,
    checkExistingAuthorization,
    setFyersVerificationStatus,
  ]);

  const startFyersAuth = () => {
    const appId = user?.fyersClientId;

    if (!appId) {
      setError("Missing Fyers client ID. Please contact support.");
      return;
    }

    localStorage.removeItem("fyers_auth_code");
    setFyersVerificationStatus("auth_started");
    setError("");

    try {
      const authUrl = generateAuthCodeURL(appId);
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error generating Fyers auth URL:", err);
      setError(
        "Failed to generate Fyers authentication URL. Please try again."
      );
      setFyersVerificationStatus("failed");
    }
  };

  const handleCredentialsSaved = () => {
    setLoading(true);
    setFyersVerificationStatus("checking");
    fetchFyersData();
  };

  // Loading state
  if (loading && fyersVerificationStatus === "checking") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Verifying your account
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please wait...
          </p>
        </div>
      </div>
    );
  }
  // Error state
  if (error && fyersVerificationStatus === "failed") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Fyers Verification Failed
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError("");
                setFyersVerificationStatus("requires_auth");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Credentials form
  if (fyersVerificationStatus === "requires_credentials") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Set Up Fyers Integration
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            To continue using the trading platform, you need to provide your
            Fyers API credentials. These will be securely encrypted before being
            stored.
          </p>
        </div>

        <FyersCredentialsForm onSaveSuccess={handleCredentialsSaved} />
      </div>
    );
  }

  // Auth required state
  if (fyersVerificationStatus === "requires_auth") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Fyers Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {hasCredentialsNotVerified
              ? "Your Fyers credentials are ready. Click the button below to verify and connect your account."
              : "To continue using the trading platform, you need to authenticate with Fyers."}
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button
            onClick={startFyersAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            {hasCredentialsNotVerified
              ? "Verify Fyers Account"
              : "Connect to Fyers"}
          </button>
        </div>
      </div>
    );
  }

  // Auth in progress state
  if (fyersVerificationStatus === "auth_started") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Fyers Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Redirecting to Fyers for authentication...
          </p>
        </div>
      </div>
    );
  }
  // Auth completed & processing state
  if (fyersVerificationStatus === "auth_completed") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Processing Fyers Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Exchanging authorization code for access token...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (fyersVerificationStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Fyers Integration Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your Fyers account has been successfully linked and access tokens
            have been securely saved. You can now access live market data and
            place trades.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Access token successfully generated and saved
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard in a moment...
          </p>
        </div>
      </div>
    );
  }

  // Fallback state (if user has credentials but hasn't verified yet)
  if (hasCredentialsNotVerified) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Fyers Connection
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your Fyers API credentials are set up, but you need to verify your
            account.
          </p>
          <button
            onClick={startFyersAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg mb-4"
          >
            Verify Fyers Account
          </button>
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
