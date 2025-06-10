import { useAuthStore } from "@/stores/authStore";
import { fyresCredentials, FyresResponse } from "@/types/fyres/types";
import { FyersCredentials, FyersAuthResponse, User } from "@/types/user";

export function generateAuthCodeURL(clientId: string): string {
  if (!clientId) {
    throw new Error("Fyers client ID is required");
  }

  try {
    const redirectUrl = encodeURIComponent(
      `${window.location.origin}/fyers-verification`
    );
    return `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&state=sample_state`;
  } catch (error) {
    console.error("Error generating Fyers auth URL:", error);
    throw new Error("Failed to generate Fyers authentication URL");
  }
}

export async function getFyersData(token: string) : Promise<fyresCredentials> {
  const response = await fetch("/api/fyers/credentials", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Fyers credentials");
  }

  const res: fyresCredentials = await response.json();
  if (!res.success) {
    throw new Error("Failed to fetch Fyers credentials");
  }

  return res;
}

export async function updateFyersCredentials(
  token: string,
  credentials: FyersCredentials
): Promise<FyersAuthResponse> {
  const encodedClientId = btoa(credentials.fyersClientId);
  const encodedSecretKey = btoa(credentials.fyersSecretKey);

  const response = await fetch("/api/fyers/credentials", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fyers_client_id: encodedClientId,
      fyers_secret_key: encodedSecretKey,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update credentials");
  }

  return (await response.json()) as FyersAuthResponse;
}

export async function updateFyersToken(
  token: string,
  authCode: string
): Promise<FyersAuthResponse> {
  const response = await fetch("/api/fyers/credentials", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fyers_auth_code: authCode,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update Fyers token");
  }

  const result = (await response.json()) as FyersAuthResponse;
  return result;
}

export async function validateFyersToken(
  token: string
): Promise<FyersAuthResponse> {
  const response = await fetch("/api/fyers/validate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to validate Fyers token");
  }

  return (await response.json()) as FyersAuthResponse;
}

export async function initializeFyersApi(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const clientId = localStorage.getItem("fyers_client_id");
  const secretKey = localStorage.getItem("fyers_secret_key");
  const authCode = localStorage.getItem("fyers_auth_code");
  const accessToken = localStorage.getItem("fyers_access_token");

  return !!(clientId && secretKey && (authCode || accessToken));
}

export function getFyersCredentialsFromBackend(backendData: unknown): {
  clientId: string | null;
  secretKey: string | null;
} {
  if (!backendData || typeof backendData !== "object")
    return { clientId: null, secretKey: null };

  const data = backendData as Record<string, unknown>;
  return {
    clientId: (data.fyers_client_id as string) || null,
    secretKey: (data.fyers_secret_key as string) || null,
  };
}

// Utility function to encode sensitive data
export function encodeSecureData(data: string): string {
  return btoa(data);
}

// Utility function to decode sensitive data
export function decodeSecureData(encodedData: string): string {
  try {
    return atob(encodedData);
  } catch (error) {
    console.error("Failed to decode data:", error);
    return "";
  }
}

// Reusable function to clear invalid Fyers tokens
export async function clearInvalidFyersTokens(): Promise<{
  success: boolean;
  user?: User;
}> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return { success: false };
    }

    const response = await fetch("/api/fyers/clear-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.user) {
        useAuthStore.getState().setUser(result.user);
      }

      return {
        success: result.success,
        user: result.user,
      };
    }
    return { success: false };
  } catch (error) {
    console.error("Error clearing invalid Fyers tokens:", error);
    return { success: false };
  }
}

export function isFyersAuthError(response: FyresResponse): boolean {
  return response && response.code === -16 && response.s === "error";
}
