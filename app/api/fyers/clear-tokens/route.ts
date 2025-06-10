import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyToken(token);
    
    if (!decodedToken || !decodedToken.email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const email = decodedToken.email;

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

    const updatedUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (updatedUser) {
      delete updatedUser.password;
    }

    return NextResponse.json({
      success: true,
      message: "Fyers tokens cleared successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error clearing Fyers tokens:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
