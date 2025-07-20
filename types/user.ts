import { ObjectId } from "mongodb";

export type DataProvider = "fyers" | "zerodha" | undefined;

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  is_verified: boolean;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Data provider selection
  dataProvider?: DataProvider;

  // Fyers API credentials
  fyersClientId?: string;
  fyersSecretKey?: string;
  fyersAuthCode?: string;
  fyersAccessToken?: string;
  fyersRefreshToken?: string;
  fyersRedirectUri?: string;
  fyersUserId?: string;

  // Zerodha API credentials
  zerodhaApiKey?: string;
  zerodhaApiSecret?: string;
  zerodhaRequestToken?: string;
  zerodhaAccessToken?: string;
  zerodhaPublicToken?: string;
  zerodhaUserId?: string;

  // Common broker settings
  tradingEnabled?: boolean;
  paperTradingMode?: boolean;
  riskManagement?: {
    maxDailyLoss?: number;
    maxPositionSize?: number;
    stopLossPercentage?: number;
  };
}

// Updated Fyers-specific interfaces
export interface FyersCredentials {
  fyersClientId: string;
  fyersSecretKey: string;
  fyersRedirectUri?: string;
}

export interface FyersAuthResponse {
  success: boolean;
  message: string;
  tokenValid?: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  tokenExchangeError?: string;
  debug?: {
    hasAuthCode?: boolean;
    hasAccessToken?: boolean;
    updateFields?: Record<string, unknown>;
    originalData?: Record<string, unknown>;
  };
}

export interface FyersTokenResponse {
  s: string;
  code: number;
  access_token?: string;
  refresh_token?: string;
  message?: string;
}

// New Zerodha-specific interfaces
export interface ZerodhaCredentials {
  zerodhaApiKey: string;
  zerodhaApiSecret: string;
}

export interface ZerodhaAuthResponse {
  success: boolean;
  message: string;
  tokenValid?: boolean;
  accessToken?: string;
  publicToken?: string;
  userId?: string;
}

export interface ZerodhaTokenResponse {
  status: string;
  data?: {
    access_token: string;
    public_token: string;
    user_id: string;
    user_name: string;
    user_shortname: string;
    email: string;
    user_type: string;
    broker: string;
  };
  message?: string;
}

// Generic broker interfaces
export interface BrokerCredentials {
  provider: DataProvider;
  credentials: FyersCredentials | ZerodhaCredentials;
}

export interface BrokerAuthResponse {
  success: boolean;
  message: string;
  provider: DataProvider;
  tokenValid?: boolean;
  accessToken?: string;
  refreshToken?: string;
  publicToken?: string;
  userId?: string;
}

// User broker configuration
export interface UserBrokerConfig {
  dataProvider: DataProvider;
  isConfigured: boolean;
  isAuthenticated: boolean;
  lastAuthDate?: Date;
  tradingEnabled: boolean;
  paperTradingMode: boolean;
}
