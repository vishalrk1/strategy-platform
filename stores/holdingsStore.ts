import { create } from "zustand";
import {
  FyresHolding,
  FyresHoldingsOverall,
  FyresHoldingsResponse,
} from "../types/fyres/types";
import { useFyersStore } from "./fyersStore";

interface HoldingsState {
  // State
  holdings: FyresHolding[];
  overall: FyresHoldingsOverall | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchHoldings: () => Promise<void>;
  resetHoldings: () => void;
}

export const useHoldingsStore = create<HoldingsState>((set) => ({
  // Initial state
  holdings: [],
  overall: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  fetchHoldings: async () => {
    set({ isLoading: true, error: null });

    try {
      const fyersStore = useFyersStore.getState();
      if (!fyersStore.isAuthorized || !fyersStore.accessToken) {
        throw new Error("User not authorized. Please login first.");
      }

      const response = await fetch("https://api-t1.fyers.in/api/v3/holdings", {
        method: "GET",
        headers: {
          Authorization: `${fyersStore.clientId}:${fyersStore.accessToken}`,
        },
      });

      const data: FyresHoldingsResponse = await response.json();

      if (data.s !== "ok") {
        throw new Error(data.message || "Failed to fetch holdings");
      }

      set({
        holdings: data.holdings,
        overall: data.overall,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching holdings:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  resetHoldings: () => {
    set({
      holdings: [],
      overall: null,
      error: null,
      lastUpdated: null,
    });
  },
}));
