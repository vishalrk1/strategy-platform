import { NextRequest, NextResponse } from "next/server";
import { userToAuthUser, verifyToken } from "@/lib/auth";
import { User } from "@/types/user";
import { getUsersCollection } from "@/lib/mongodb";

export async function GET(
  request: NextRequest
) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verifiedUser = verifyToken(token);
    if (!verifiedUser || !verifiedUser.email) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const email = verifiedUser.email;
    const usersCollection = await getUsersCollection(); 
    
    // Find user by email
    const mongoUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });
    
    if (!mongoUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user is verified
    if (!mongoUser.is_verified) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Your account is not verified. Please try again after some time."
        },
        { status: 403 }
      );
    }
    
    const user = userToAuthUser(mongoUser as User);

    return NextResponse.json({
      success: true,
      message: "Token is valid",
      user,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
