export interface HammerStrategyFormData {
  // Step 1: Strategy Name
  strategyName: string;

  // Step 2: Basic Configuration
  index: string;
  positionType: "intraday" | "overnight";
  timeframe: string;
  priceCandleRatio: string;
  bodyTailRatio: string;
  stocksAllowed: string;
  priceRangeMin: string;
  priceRangeMax: string;

  // Step 3: Risk Management & Targets
  stoplossType: "percentage" | "rupees";
  stoplossRupees: string;
  stoplossPercentage: string;
  squareOffBy310: "yes" | "no";
  exitQty1: string;
  exitQty2: string;
  exitQty3: string;
  exitQty4: string;
  target1: string;
  target2: string;
  target3: string;
  target4: string;

  // Step 4: Terms
  termsAccepted: boolean;
  riskDisclosure: boolean;
}
