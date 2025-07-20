import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/types/user";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  if (!user.email) {
    throw new Error("User email is required for token generation");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      is_verified: user.is_verified,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): Partial<User> | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name?: string;
      is_verified?: boolean;
    };

    return {
      _id: new ObjectId(decoded.id),
      email: decoded.email,
      name: decoded.name || "",
      password: "",
      is_verified: decoded.is_verified || false,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function userToAuthUser(user: User): User {
  return {
    ...user,
    dataProvider: user.dataProvider || undefined,
    fyersClientId: user.fyersClientId || "",
    fyersSecretKey: user.fyersSecretKey || "",
    fyersAuthCode: user.fyersAuthCode || "",
    fyersAccessToken: user.fyersAccessToken || "",
    fyersRefreshToken: user.fyersRefreshToken || "",
    fyersRedirectUri: user.fyersRedirectUri || "",
    fyersUserId: user.fyersUserId || "",
    zerodhaApiKey: user.zerodhaApiKey || "",
    zerodhaApiSecret: user.zerodhaApiSecret || "",
    zerodhaRequestToken: user.zerodhaRequestToken || "",
    zerodhaAccessToken: user.zerodhaAccessToken || "",
    zerodhaPublicToken: user.zerodhaPublicToken || "",
    zerodhaUserId: user.zerodhaUserId || "",
    tradingEnabled: user.tradingEnabled || false,
    paperTradingMode: user.paperTradingMode || false,
    is_verified: user.is_verified || false,
    riskManagement: user.riskManagement || {
      maxDailyLoss: 0,
      maxPositionSize: 0,
      stopLossPercentage: 0,
    },
  };
}
