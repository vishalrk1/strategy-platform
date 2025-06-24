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

export interface FyresPosition {
  netQty: number;
  qty: number;
  avgPrice: number;
  netAvg: number;
  side: number;
  productType: string;
  realized_profit: number;
  unrealized_profit: number;
  pl: number;
  ltp: number;
  buyQty: number;
  buyAvg: number;
  buyVal: number;
  sellQty: number;
  sellAvg: number;
  sellVal: number;
  slNo: number;
  fyToken: string;
  crossCurrency: string;
  rbiRefRate: number;
  qtyMulti_com: number;
  segment: number;
  symbol: string;
  id: string;
  cfBuyQty: number;
  cfSellQty: number;
  dayBuyQty: number;
  daySellQty: number;
  exchange: number;
}

export interface FyresPositionsOverall {
  count_total: number;
  count_open: number;
  pl_total: number;
  pl_realized: number;
  pl_unrealized: number;
}

export interface FyresPositionsResponse extends FyresResponse {
  netPositions: FyresPosition[];
  overall: FyresPositionsOverall;
}
