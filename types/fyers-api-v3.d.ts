declare module 'fyers-api-v3' {
  export interface FyersTokenResponse {
    s: string;
    code: number;
    message?: string;
    access_token?: string;
    refresh_token?: string;
  }

  export interface FyersTokenRequest {
    secret_key: string;
    auth_code: string;
  }

  export class fyersModel {
    constructor();
    setAppId(appId: string): void;
    setRedirectUrl(redirectUrl: string): void;
    generate_access_token(request: FyersTokenRequest): Promise<FyersTokenResponse>;
  }
}
