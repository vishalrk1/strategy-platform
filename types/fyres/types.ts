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

export interface FyresHolding {
  holdingType: string;
  quantity: number;
  costPrice: number;
  marketVal: number;
  remainingQuantity: number;
  pl: number;
  ltp: number;
  id: number;
  fyToken: number;
  exchange: number;
  symbol: string;
  segment: number;
  isin: string;
  qty_t1: number;
  remainingPledgeQuantity: number;
  collateralQuantity: number;
}

export interface FyresHoldingsOverall {
  count_total: number;
  total_investment: number;
  total_current_value: number;
  total_pl: number;
  pnl_perc: number;
}

export interface FyresHoldingsResponse extends FyresResponse {
  holdings: FyresHolding[];
  overall: FyresHoldingsOverall;
}
