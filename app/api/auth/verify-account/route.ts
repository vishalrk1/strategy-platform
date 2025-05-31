import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { userToAuthUser } from "@/lib/auth";
import { User } from "@/types/user";

// This endpoint allows verifying a user account
// In a production environment, this would typically be triggered 
// by clicking a link in a verification email
export async function POST(
  request: NextRequest
): Promise<NextResponse> {  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // In a real-world scenario, you would validate the verification token
    // against a token stored in the database when the user registered
    // For this example, we'll just mark the user as verified

    const usersCollection = await getUsersCollection();
    
    // Find and update the user
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { is_verified: true, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const user = userToAuthUser(result as unknown as User);

    return NextResponse.json({
      success: true,
      message: "Account verified successfully",
      user
    });
  } catch (error) {
    console.error("Account verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
