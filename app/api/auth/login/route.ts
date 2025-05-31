import { NextRequest, NextResponse } from "next/server";
import { LoginCredentials, AuthResponse, User } from "@/types/user";
import { getUsersCollection } from "@/lib/mongodb";
import { generateToken, userToAuthUser, verifyPassword } from "@/lib/auth";

export async function POST(
  request: NextRequest
): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection(); // Find user by email
    const mongoUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!mongoUser) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    } // Verify password
    const isPasswordValid = await verifyPassword(password, mongoUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!mongoUser.is_verified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is not verified. Please try again after some time.",
        },
        { status: 403 }
      );
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: mongoUser._id },
      { $set: { updatedAt: new Date() } }
    );

    const user = userToAuthUser(mongoUser as User);
    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
