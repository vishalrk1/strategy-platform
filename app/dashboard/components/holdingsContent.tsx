import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../utils/dashboardUtils";

const HoldingsContent = () => {
  // This is a placeholder. In a real app, you would fetch holdings data from your store
  const mockHoldings = [
    {
      symbol: "RELIANCE",
      exchange: "NSE",
      qty: 10,
      avgPrice: 2750.25,
      ltp: 2800.50,
      pl: 502.50,
      plPercentage: 1.82
    },
    {
      symbol: "INFY",
      exchange: "NSE",
      qty: 25,
      avgPrice: 1455.75,
      ltp: 1510.25,
      pl: 1362.50,
      plPercentage: 3.74
    }
  ];

  return (
    <div className="w-full">
      {mockHoldings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {mockHoldings.map((holding, index) => (
            <div key={index} className="bg-card/50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{holding.symbol}</span>
                  <Badge variant="outline" className="ml-2">
                    {holding.exchange}
                  </Badge>
                </div>
                <div className={holding.pl >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(holding.pl)} ({holding.plPercentage.toFixed(2)}%)
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>Qty: {holding.qty}</div>
                <div>Avg: {holding.avgPrice.toFixed(2)}</div>
                <div>LTP: {holding.ltp.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No holdings available. Your investments will appear here.
        </div>
      )}
    </div>
  );
};

export default HoldingsContent;
