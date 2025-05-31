"use client";

import React, { useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart3, Settings } from "lucide-react";
import { StrategyModal } from "@/components/StrategyModal";
import { BrokerSettingsModal } from "@/components/BrokerSettingsModal";
import { useAuthStore } from "@/stores/authStore";
import { useFyersStore } from "@/stores/fyersStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { getFundsLimit, fund_limit } = useFyersStore();

  useEffect(() => {
    const fetchFundsLimit = async () => {
      try {
        await getFundsLimit();
      } catch (error) {
        console.error("Failed to fetch funds limit:", error);
      }
    };

    if (!user) {
      fetchFundsLimit();
    }
  }, [user, getFundsLimit]);

  // Process fund_limit data outside of the return statement
  const fundData = useMemo(() => {
    if (!fund_limit || fund_limit.length === 0) return null;

    const totalBalance =
      fund_limit.find((item) => item.title === "Total Balance")?.equityAmount ||
      0;
    const usedAmount =
      fund_limit.find((item) => item.title === "Utilized Amount")
        ?.equityAmount || 0;
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
  }, [fund_limit]);

  // Currency formatter function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="px-2 sm:px-0">
            <div className="p-2">
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Welcome to your Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Monitor your trading strategies and portfolio performance in
                  real-time.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg mt-3 sm:my-2.5">
            <div className="py-3 sm:py-5 px-2 sm:px-6">
              {fundData && (
                <div className="mb-2 sm:mb-3 rounded-lg sm:p-3">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white mb-2">
                    Funds Overview
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mb-1.5 mt-2 sm:mt-4">
                    <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
                      Total: {formatCurrency(fundData.totalBalance)}
                    </span>
                    <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
                      Used: {formatCurrency(fundData.usedAmount)} | Available:{" "}
                      {formatCurrency(fundData.availableBalance)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-8 sm:h-10 overflow-hidden mt-2">
                    <div className="flex h-full">
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${fundData.usedPercentage}%` }}
                        title={`Used: ${formatCurrency(fundData.usedAmount)}`}
                      ></div>
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${fundData.availablePercentage}%` }}
                        title={`Available: ${formatCurrency(
                          fundData.availableBalance
                        )}`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 mt-4">
                  <BrokerSettingsModal>
                    <StrategyModal>
                      <button className="relative block w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 border-dashed rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <BarChart3 className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <span className="mt-2 block text-sm font-medium text-blue-600 dark:text-blue-400">
                          Create New Strategy
                        </span>
                      </button>
                    </StrategyModal>
                  </BrokerSettingsModal>
                  <BrokerSettingsModal>
                    <button className="relative block w-full bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 border-dashed rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      <Settings className="mx-auto h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <span className="mt-2 block text-sm font-medium text-purple-600 dark:text-purple-400">
                        Account Settings
                      </span>
                    </button>
                  </BrokerSettingsModal>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
