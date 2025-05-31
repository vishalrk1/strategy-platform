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
