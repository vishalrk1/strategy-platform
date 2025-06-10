export interface FyresResponse {
  code: number;
  s: string;
  message: string;
  [key: string]: any;
}

export interface FyersFundsLimit {
  id: string;
  title: string;
  equityAmount: number;
  commodityAmount: number;
}

export interface fyresCredentials {
  fyers_client_id: string;
  fyers_secret_key: string;
  fyers_access_token: string;
  fyers_refresh_token: string;
  fyers_auth_code?: string;
  token_valid: boolean;
  [key: string]: string | boolean | null | undefined;
}