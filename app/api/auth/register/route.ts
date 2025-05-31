import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { hashPassword, userToAuthUser, generateToken } from "@/lib/auth";
import { RegisterCredentials, AuthResponse, User } from "@/types/user";

export async function POST(
  request: NextRequest
): Promise<NextResponse<AuthResponse>> {
  try {
    const body: RegisterCredentials = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser: User = userToAuthUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || "",
      is_verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await usersCollection.insertOne(newUser);

    const authUser = userToAuthUser({
      ...newUser,
      _id: result.insertedId,
    });

    const token = generateToken(authUser);

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: authUser,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
