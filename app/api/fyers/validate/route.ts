import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
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

    if (!user.fyersClientId || !user.fyersAccessToken) {
      return NextResponse.json({
        success: false,
        is_valid: false,
        message: "Fyers credentials not found",
      });
    }

    try {
      const profileResponse = await fetch(
        "https://api-t1.fyers.in/api/v3/funds",
        {
          method: "GET",
          headers: {
            Authorization: `${user.fyersClientId}:${user.fyersAccessToken}`,
          },
        }
      );

      const profileResult = await profileResponse.json();
      if (profileResult.code === 200 && profileResult.s === "ok") {
        return NextResponse.json({
          success: true,
          is_valid: true,
          tokenValid: true,
          funds: profileResult?.fund_limit,
          message: "Fyers token is valid",
        });
      } else {
        await usersCollection.updateOne(
          { _id: new ObjectId(decoded._id) },
          {
            $unset: {
              fyersAccessToken: "",
              fyersRefreshToken: "",
            },
            $set: {
              updatedAt: new Date(),
            },
          }
        );
        return NextResponse.json({
          success: false,
          is_valid: false,
          tokenValid: false,
          message: "Fyers token is invalid or expired",
        });
      }
    } catch (error) {
      console.error("Error validating Fyers token:", error);
      return NextResponse.json({
        success: false,
        is_valid: false,
        tokenValid: false,
        message: "Failed to validate Fyers token",
      });
    }
  } catch (error) {
    console.error("Error validating Fyers token:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
