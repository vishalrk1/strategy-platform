import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { User } from "@/types/user";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded._id),
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fyers_client_id: user.fyersClientId
        ? Buffer.from(user.fyersClientId, "utf-8").toString("base64")
        : null,
      fyers_secret_key: user.fyersSecretKey
        ? Buffer.from(user.fyersSecretKey, "utf-8").toString("base64")
        : null,
      fyers_access_token: user.fyersAccessToken || null,
      fyers_refresh_token: user.fyersRefreshToken || null,
      token_valid: !!user.fyersAccessToken,
    });
  } catch (error) {
    console.error("Error fetching Fyers credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fyers_client_id, fyers_secret_key, fyers_auth_code } = body;

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded._id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updateFields: Partial<User> = {
      updatedAt: new Date(),
    };

    if (fyers_client_id) {
      try {
        const decoded = Buffer.from(fyers_client_id, "base64").toString(
          "utf-8"
        );
        if (decoded && decoded.length > 0 && !decoded.includes("�")) {
          updateFields.fyersClientId = decoded;
        } else {
          updateFields.fyersClientId = fyers_client_id;
        }
      } catch {
        updateFields.fyersClientId = fyers_client_id;
      }
    }

    if (fyers_secret_key) {
      try {
        const decoded = Buffer.from(fyers_secret_key, "base64").toString(
          "utf-8"
        );

        if (decoded && decoded.length > 0 && !decoded.includes("�")) {
          updateFields.fyersSecretKey = decoded;
        } else {
          updateFields.fyersSecretKey = fyers_secret_key;
        }
      } catch {
        updateFields.fyersSecretKey = fyers_secret_key;
      }
    }

    if (fyers_auth_code !== undefined) {
      updateFields.fyersAuthCode = fyers_auth_code || "";
    }

    updateFields.fyersAccessToken = "";
    updateFields.fyersRefreshToken = "";
    let tokenExchangeError: string | null = null;

    if (fyers_auth_code) {
      const clientId = updateFields.fyersClientId || user.fyersClientId;
      const secretKey = updateFields.fyersSecretKey || user.fyersSecretKey;

      if (clientId && secretKey) {
        try {
          const tokenResult = await exchangeAuthCodeForToken(
            clientId,
            secretKey,
            fyers_auth_code
          );

          if (tokenResult.success && tokenResult.access_token) {
            updateFields.fyersAccessToken = tokenResult.access_token;
            updateFields.fyersRefreshToken = tokenResult.refresh_token || "";
          } else {
            tokenExchangeError =
              tokenResult.message ||
              "Failed to exchange auth code for access token";
            console.error("Token exchange failed:", {
              error: tokenExchangeError,
              errorCode: tokenResult.error_code,
              response: tokenResult,
            });
            updateFields.fyersAccessToken = "";
            updateFields.fyersRefreshToken = "";
          }
        } catch (error) {
          tokenExchangeError = "Network error during token exchange";
          console.error("Failed to exchange auth code for token:", error);
          updateFields.fyersAccessToken = "";
          updateFields.fyersRefreshToken = "";
        }
      } else {
        tokenExchangeError =
          "Missing Fyers client ID or secret key for token exchange";
      }
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(decoded._id) },
      {
        $set: updateFields,
      }
    );

    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(decoded._id),
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: updateFields.fyersAccessToken
        ? "Fyers credentials updated and access token generated successfully"
        : "Fyers credentials updated successfully",
      fyers_client_id: updatedUser?.fyersClientId || null,
      fyers_secret_key: updatedUser?.fyersSecretKey || null,
      fyers_access_token: updatedUser?.fyersAccessToken || null,
      fyers_refresh_token: updatedUser?.fyersRefreshToken || null,
      token_valid: !!updatedUser?.fyersAccessToken,
      tokenValid: !!updatedUser?.fyersAccessToken, // For consistency with validation endpoint
      accessToken: updatedUser?.fyersAccessToken || null, // For frontend state management
      refreshToken: updatedUser?.fyersRefreshToken || null, // For frontend state management
      tokenExchangeError: tokenExchangeError, // Include any token exchange errors
      debug: {
        updateFields: updateFields,
        originalData: {
          fyers_client_id,
          fyers_secret_key,
          fyers_auth_code,
        },
        hasAuthCode: !!fyers_auth_code,
        hasAccessToken: !!updatedUser?.fyersAccessToken,
      },
    });
  } catch (error) {
    console.error("Error updating Fyers credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to exchange auth code for token using Fyers API v3
async function exchangeAuthCodeForToken(
  clientId: string,
  secretKey: string,
  authCode: string
) {
  try {
    // Import Fyers API v3
    const { fyersModel } = await import("fyers-api-v3");

    // Create a new instance of FyersAPI
    const fyers = new fyersModel();

    // Set your APPID obtained from Fyers
    fyers.setAppId(clientId);

    // Set the RedirectURL (this should match the one used during auth)
    fyers.setRedirectUrl(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/fyers-verification`
    );

    // Generate access token using auth code and secret key
    const response = await fyers.generate_access_token({
      secret_key: secretKey,
      auth_code: authCode,
    });

    if (response.s === "ok" && response.code === 200 && response.access_token) {
      return {
        success: true,
        access_token: response.access_token,
        refresh_token: response.refresh_token || "",
        message: response.message || "Token generated successfully",
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to exchange auth code for token",
        error_code: response.code,
      };
    }
  } catch (error) {
    console.error("Error exchanging auth code for token:", error);
    return {
      success: false,
      message: `Failed to exchange auth code for token: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
