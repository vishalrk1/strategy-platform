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

    // Return Zerodha credentials (without sensitive data in plain text)
    return NextResponse.json({
      success: true,
      zerodha_api_key: user.zerodhaApiKey || null,
      zerodha_api_secret: user.zerodhaApiSecret || null,
      zerodha_access_token: user.zerodhaAccessToken || null,
      token_valid: !!user.zerodhaAccessToken,
    });
  } catch (error) {
    console.error("Error fetching Zerodha credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
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
    const { zerodha_api_key, zerodha_api_secret } = body;

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

    const updateData: Partial<User> = {
      zerodhaApiKey: zerodha_api_key,
      zerodhaApiSecret: zerodha_api_secret,
      updatedAt: new Date(),
    };

    // Update user with new Zerodha data
    await usersCollection.updateOne(
      { _id: new ObjectId(decoded._id) },
      {
        $set: updateData,
      }
    );

    // Fetch updated user
    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(decoded._id),
    });

    return NextResponse.json({
      success: true,
      message: "Zerodha credentials updated successfully",
      zerodha_api_key: updatedUser?.zerodhaApiKey || null,
      zerodha_api_secret: updatedUser?.zerodhaApiSecret || null,
      zerodha_access_token: updatedUser?.zerodhaAccessToken || null,
      token_valid: !!updatedUser?.zerodhaAccessToken,
    });
  } catch (error) {
    console.error("Error updating Zerodha credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
