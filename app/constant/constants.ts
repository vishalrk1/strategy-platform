import {
  IndexOption,
  SourceOption,
  Strategy,
  TimeframeOption,
} from "@/types/modal/maModal";

export const ALGO_STRATERGIES: Strategy[] = [
  {
    id: "ma-strategy",
    name: "MA Strategy",
    title: "Moving Average Strategy",
    description:
      "This strategy uses moving averages to identify trend direction and generate buy/sell signals. Perfect for both intraday and overnight positions with customizable risk management.",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
  {
    id: "hammer-strategy",
    name: "Hammer Strategy",
    title: "Hammer Candlestick Strategy",
    description:
      "This strategy identifies hammer candlestick patterns to spot potential reversals and generate trade signals. Suitable for traders looking for price action-based entries.",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
];

export const INDEX_OPTIONS: IndexOption[] = [
  { value: "nifty50", label: "Nifty 50", maxStocks: 50 },
  { value: "niftynext50", label: "Nifty Next 50", maxStocks: 50 },
  { value: "nifty100", label: "Nifty 100", maxStocks: 100 },
  { value: "nifty200", label: "Nifty 200", maxStocks: 200 },
  { value: "nifty500", label: "Nifty 500", maxStocks: 500 },
];

export const TIME_FRAME_OPTIONS: TimeframeOption[] = [
  { value: "5", label: "5 Minutes" },
  { value: "15", label: "15 Minutes" },
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour" },
  { value: "120", label: "2 Hours" },
  { value: "180", label: "3 Hours" },
  { value: "day", label: "Day" },
];

export const SOURCE_OPTIONS: SourceOption[] = [
  { value: "open", label: "Open" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
  { value: "close", label: "Close" },
];
