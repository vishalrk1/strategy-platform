export interface Strategy {
  id: string;
  name: string;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  titleColor: string;
}

export interface IndexOption {
  value: string;
  label: string;
  maxStocks: number;
}

export interface TimeframeOption {
  value: string;
  label: string;
}

export interface SourceOption {
  value: string;
  label: string;
}

export interface MaStrategyFormData {
  // Step 1: Strategy Name
  strategyName: string;

  // Step 2: Basic Configuration
  index: string;
  positionType: "intraday" | "overnight";
  timeframe: string;
  movingAverageLength: string;
  source: string;
  stocksAllowed: string;
  priceRangeMin?: string;
  priceRangeMax?: string;

  // Step 3: Risk Management & Targets
  riskManagementType: "percentage" | "rupees";
  stoplossRupees?: string;
  stoplossPercentage?: string;
  maxProfitRupees?: string;
  maxProfitPercentage?: string;
  squareOffBy310: boolean;

  // Step 4: Terms
  termsAccepted: boolean;
  riskDisclosure: boolean;
}

// Optional type for step-based form handling
export type FormStep = number;
