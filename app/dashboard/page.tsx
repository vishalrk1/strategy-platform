"use client";

import React, { useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart3, Settings } from "lucide-react";
import { StrategyModal } from "@/components/StrategyModal";
import { BrokerSettingsModal } from "@/components/BrokerSettingsModal";
import { useAuthStore } from "@/stores/authStore";
import { useFyersStore } from "@/stores/fyersStore";
import { formatCurrency, getFundsDetails } from "./utils/dashboardUtils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useHoldingsStore } from "@/stores/holdingsStore";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { getFundsLimit, fund_limit } = useFyersStore();
  const { fetchHoldings, overall } = useHoldingsStore();

  useEffect(() => {
    const fetchFundsLimit = async () => {
      try {
        await getFundsLimit();
      } catch (error) {
        console.error("Failed to fetch funds limit:", error);
      }
    };

    if (user) {
      fetchFundsLimit();
      fetchHoldings();
    }
  }, [user, getFundsLimit, fetchHoldings]);

  const fundData = useMemo(() => {
    return getFundsDetails(fund_limit);
  }, [fund_limit]);

  console.log(overall);

  return (
    <ProtectedRoute>
      <main className="max-w-[90%] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between px-6 py-4 rounded-md">
          <div className="w-full flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-accent-foreground">
                Portfolio
              </h1>
              {user && (
                <Badge className="text-lg" variant="secondary">
                  {user?.dataProvider}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              <StrategyModal>
                <Button
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
                >
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">Create New Strategy</span>
                </Button>
              </StrategyModal>
              <BrokerSettingsModal>
                <Button
                  variant="outline"
                  className="bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600"
                >
                  <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="ml-2">Account Settings</span>
                </Button>
              </BrokerSettingsModal>
            </div>
          </div>
        </div>
        <Card className="mb-6 border-none shadow-xs bg-accent/30 p-0">
          <CardHeader className="flex items-center bg-gradient-to-r from-green-300/20 to-accent/30 mx-4 my-3 rounded-lg">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center p-2">
                <div className="flex flex-col items-start">
                  <div className="text-muted-foreground text-lg">Total PnL</div>
                  <div className="text-green-500 font-semibold text-lg">
                    {overall ? formatCurrency(overall?.total_pl) : "Loading..."}
                  </div>
                </div>
                <div className="ml-4 md:ml-16 flex items-center justify-around space-x-6 h-full">
                  <div className="flex flex-col items-start">
                    <div className="text-muted-foreground text-lg">
                      Realised
                    </div>
                    <div className="text-green-500 font-semibold text-lg">
                      {fundData
                        ? formatCurrency(fundData.totalBalance)
                        : "Loading..."}
                    </div>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-white/50 dark:bg-white/20 border-2 h-full"
                  />
                  <div className="flex flex-col items-start">
                    <div className="text-muted-foreground text-lg">
                      Unrealised
                    </div>
                    <div className="text-green-500 font-semibold text-lg">
                      {fundData
                        ? formatCurrency(fundData.totalBalance)
                        : "Loading..."}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2 mr-8">
                    <span className="text-muted-foreground text-sm">
                      Funds Available:
                    </span>
                    <span className="font-semibold text-sm">
                      {fundData
                        ? formatCurrency(fundData.totalBalance) //(fundData.usedPercentage * 100).toFixed(2)
                        : 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 flex overflow-hidden">
                    <div
                      className="bg-green-500 h-1"
                      style={{
                        width: fundData
                          ? `${fundData.availablePercentage}%`
                          : "100%",
                      }}
                    ></div>
                    <div
                      className="bg-red-500 h-1"
                      style={{
                        width: fundData
                          ? `${fundData.usedPercentage * 100}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
