import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Clear Fyers access token, refresh token, and auth code
    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          fyersAccessToken: "",
          fyersRefreshToken: "",
          fyersAuthCode: "",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Fyers tokens cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing Fyers tokens:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
