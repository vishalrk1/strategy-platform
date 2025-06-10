import { FyersFundsLimit } from "@/types/fyres/types";

// Currency formatter function
export const getFundsDetails = (fund_limit: FyersFundsLimit[]) => {
  if (!fund_limit || fund_limit.length === 0) return null;
  const totalBalance =
    fund_limit.find((item) => item.title === "Total Balance")?.equityAmount ||
    0;
  const usedAmount =
    fund_limit.find((item) => item.title === "Utilized Amount")?.equityAmount ||
    0;
  const availableBalance =
    fund_limit.find((item) => item.title === "Available Balance")
      ?.equityAmount || 0;

  // Calculate percentage for progress bar
  const usedPercentage =
    totalBalance > 0 ? (usedAmount / totalBalance) * 100 : 0;
  const availablePercentage = 100 - usedPercentage;
  return {
    totalBalance,
    usedAmount,
    availableBalance,
    usedPercentage,
    availablePercentage,
  };
};

// Currency formatter function
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};
