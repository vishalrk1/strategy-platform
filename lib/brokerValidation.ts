"use client";

import { User } from "@/types/user";
import { clearInvalidFyersTokens } from "./fyersApi";

export function hasValidBrokerCredentials(user: User | null): boolean {
  if (!user) {
    return false;
  }

  if (!user.dataProvider) {
    return false;
  }

  switch (user.dataProvider) {
    case "fyers":
      const hasFyersCredentials = !!(user.fyersClientId && user.fyersSecretKey);
      const hasFyersToken = !!user.fyersAccessToken;

      return hasFyersCredentials && hasFyersToken;

    case "zerodha":
      const hasZerodhaCredentials = !!(
        user.zerodhaApiKey && user.zerodhaApiSecret
      );
      const hasZerodhaToken = !!user.zerodhaAccessToken;
      return hasZerodhaCredentials && hasZerodhaToken;
    default:
      return false;
  }
}

export async function validateFyersToken(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/fyers/validate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    // If validation fails due to authentication error, clear tokens
    if (
      !data.success &&
      !data.isValid &&
      data.message?.includes("authentication failed")
    ) {
      await clearInvalidFyersTokens();
      return false;
    }

    return data.success && data.isValid;
  } catch (error) {
    console.error("Error validating Fyers token:", error);
    return false;
  }
}

/**
 * Comprehensive broker validation that checks both credentials and token validity
 * @param user - The authenticated user object
 * @param verificationStatus - Current Fyers verification status
 * @param authToken - The authentication token for API calls
 * @returns Promise<boolean> indicating whether the broker setup is fully valid
 */
export async function validateBrokerSetup(
  user: User | null,
  verificationStatus?:
    | "checking"
    | "requires_credentials"
    | "requires_auth"
    | "auth_started"
    | "auth_completed"
    | "success"
    | "failed",
  authToken?: string
): Promise<boolean> {
  // First check basic credentials
  if (!hasValidBrokerCredentials(user)) {
    return false;
  }

  // For Fyers, additionally validate the token if needed
  if (
    user?.dataProvider === "fyers" &&
    authToken &&
    verificationStatus !== "success"
  ) {
    return await validateFyersToken(authToken);
  }

  return true;
}
