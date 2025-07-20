import { create } from "zustand";
import {
  FyresPosition,
  FyresPositionsOverall,
  FyresPositionsResponse,
} from "../types/fyres/types";
import { useFyersStore } from "./fyersStore";

interface PositionsState {
  // State
  positions: FyresPosition[];
  overall: FyresPositionsOverall | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchPositions: () => Promise<void>;
  resetPositions: () => void;
}

export const usePositionsStore = create<PositionsState>((set) => ({
  // Initial state
  positions: [],
  overall: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  fetchPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const fyersStore = useFyersStore.getState();

      const response = await fetch("https://api-t1.fyers.in/api/v3/positions", {
        method: "GET",
        headers: {
          Authorization: `${fyersStore.clientId}:${fyersStore.accessToken}`,
        },
      });
      const data: FyresPositionsResponse = await response.json();
      if (data.s !== "ok") {
        throw new Error(data.message || "Failed to fetch positions");
      }
      set({
        positions: data.netPositions,
        overall: data.overall,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching positions:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  resetPositions: () => {
    set({
      positions: [],
      overall: null,
      error: null,
      lastUpdated: null,
    });
  },
}));
