"use client";

import React, { useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart3, Settings } from "lucide-react";
import { BrokerSettingsModal } from "@/components/BrokerSettingsModal";
import { useAuthStore } from "@/stores/authStore";
import { useFyersStore } from "@/stores/fyersStore";
import { formatCurrency, getFundsDetails } from "./utils/dashboardUtils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePositionsStore } from "@/stores/positionsStore";
import MAStrategyModal from "@/components/modal/MaModal";
import { Skeleton } from "@/components/ui/skeleton";
import PortfolioContent from "./components/portfolioContent";
import HoldingsContent from "./components/holdingsContent";
import BottomBorderTab from "@/components/ui/BottomBorderTab";

export default function Dashboard() {
  const { user } = useAuthStore();
  const fyersStore = useFyersStore();
  const { fund_limit } = fyersStore;
  const {
    fetchPositions,
    overall: overallPositions,
    isLoading: isPositionsLoading,
  } = usePositionsStore();
  const isFundsLoading = fyersStore.fund_limit.length === 0; // crude loading state for funds

  useEffect(() => {
    fyersStore.initialize();
  }, []);

  useEffect(() => {
    if (!user) return;
    fyersStore.setFyersStoreData(user);
  }, [user]);

  useEffect(() => {
    const fetchFundsLimit = async () => {
      try {
        await fyersStore.getFundsLimit();
      } catch (error) {
        console.error("Failed to fetch funds limit:", error);
      }
    };

    const fetchPositionsData = async () => {
      try {
        await fetchPositions();
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    };

    if (user && fyersStore.isAuthorized) {
      fetchFundsLimit();
      fetchPositionsData();
    }
  }, [user, fyersStore.isAuthorized]);

  const fundData = useMemo(() => {
    return getFundsDetails(fund_limit);
  }, [fund_limit]);

  const portfolioTabs = [
    {
      id: "positions",
      title: "Positions",
      content: <PortfolioContent />,
    },
    {
      id: "holdings",
      title: "Holdings",
      content: <HoldingsContent />,
    },
  ];

  return (
    <ProtectedRoute>
      <main className="max-w-[90%] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between px-6 py-4 rounded-md">
          <div className="w-full flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-accent-foreground">
                Portfolio
              </h1>
              {user && user.dataProvider && (
                <Badge className="text-lg" variant="secondary">
                  {user?.dataProvider}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              {/* Create Strategy Button Skeleton */}
              {isFundsLoading || isPositionsLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : user && user?.fyersAccessToken ? (
                <MAStrategyModal />
              ) : (
                <BrokerSettingsModal>
                  <Button
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
                  >
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {user?.dataProvider ? (
                      <span>{`Connect to ${user?.dataProvider}`}</span>
                    ) : (
                      <span>Connect to Broker</span>
                    )}
                  </Button>
                </BrokerSettingsModal>
              )}
              <Button
                variant="outline"
                className="bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600"
              >
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="ml-2">Account Settings</span>
              </Button>
            </div>
          </div>
        </div>
        <Card className="mb-6 border-none shadow-xs bg-accent/30 p-0 gap-0">
          <CardHeader className="flex items-center bg-gradient-to-r from-green-300/20 to-accent/30 m-3 rounded-lg">
            {isFundsLoading || isPositionsLoading ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center p-2">
                  {/* Total P&L */}
                  <div className="flex flex-col items-start min-w-[120px]">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  {/* Realised/Unrealised P&L */}
                  <div className="ml-4 md:ml-16 flex items-center justify-around space-x-6 h-full">
                    {/* Realised */}
                    <div className="flex flex-col items-center justify-center min-w-[120px]">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-white/50 dark:bg-white/20 border-2 h-full"
                    />
                    {/* Unrealised */}
                    <div className="flex flex-col items-center justify-center min-w-[120px]">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2 mr-8">
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-2 w-40 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center p-2">
                  <div className="flex flex-col items-start">
                    <div className="text-muted-foreground text-lg">
                      Total P&L
                    </div>
                    <div
                      className={`text-lg ${
                        overallPositions
                          ? overallPositions.pl_total >= 0
                            ? "text-green-700"
                            : "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {overallPositions
                        ? formatCurrency(overallPositions.pl_total)
                        : "NA"}
                    </div>
                  </div>
                  <div className="ml-4 md:ml-16 flex items-center justify-around space-x-6 h-full">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-muted-foreground text-lg">
                        Realised P&L
                      </div>
                      <div
                        className={`text-lg ${
                          overallPositions
                            ? overallPositions.pl_realized >= 0
                              ? "text-green-700"
                              : "text-red-700"
                            : "text-green-700"
                        }`}
                      >
                        {overallPositions
                          ? formatCurrency(overallPositions.pl_realized)
                          : "NA"}
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-white/50 dark:bg-white/20 border-2 h-full"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-muted-foreground text-lg">
                        Unrealised P&L
                      </div>
                      <div
                        className={`text-lg ${
                          overallPositions
                            ? overallPositions.pl_unrealized >= 0
                              ? "text-green-700"
                              : "text-red-700"
                            : "text-green-700"
                        }`}
                      >
                        {overallPositions
                          ? formatCurrency(overallPositions.pl_unrealized)
                          : "NA"}
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
            )}
          </CardHeader>
          <BottomBorderTab
            tabs={portfolioTabs}
            className="mx-4 my-0"
            borderColor="bg-primary"
            activeTabClass="text-primary font-semibold"
            inactiveTabClass="text-muted-foreground"
          />
        </Card>
      </main>
    </ProtectedRoute>
  );
}
