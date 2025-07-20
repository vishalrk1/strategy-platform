import { Badge } from "@/components/ui/badge";
import React from "react";
import { usePositionsStore } from "@/stores/positionsStore";
import { formatCurrency } from "../utils/dashboardUtils";

const PortfolioContent = () => {
  const { positions } = usePositionsStore();

  return (
    <div className="w-full">
      {positions && positions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {positions.map((position, index) => (
            <div key={index} className="bg-card/50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{position.symbol}</span>
                  <Badge variant="outline" className="ml-2">
                    {position.side === 1 ? "BUY" : "SELL"}
                  </Badge>
                </div>
                <div className={position.pl >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(position.pl)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>Qty: {position.qty}</div>
                <div>Avg: {position.avgPrice}</div>
                <div>LTP: {position.ltp}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No positions available. Positions will appear here when you have active trades.
        </div>
      )}
    </div>
  );
};

export default PortfolioContent;
