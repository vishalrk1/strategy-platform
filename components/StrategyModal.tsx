"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { hasValidBrokerCredentials } from "@/lib/brokerValidation";
import { BrokerSettingsModal } from "@/components/BrokerSettingsModal";

interface StrategyModalProps {
  children?: React.ReactNode;
}

const strategies = [
  {
    value: "ma9",
    label: "MA9 Algo",
    description: "Moving Average 9 period strategy",
  },
  {
    value: "hammer",
    label: "Hammer Algo",
    description: "Hammer candlestick pattern strategy",
  },
];

export function StrategyModal({ children }: StrategyModalProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBrokerSettings, setShowBrokerSettings] = useState(false);

  const { user } = useAuthStore();

  const isValidToken = (accessToken: string | null | undefined): boolean => {
    return typeof accessToken === "string" && accessToken.trim() !== "";
  };

  const handleCreateStrategy = async () => {
    if (!selectedStrategy) return;
    const hasValidCredentials = hasValidBrokerCredentials(user);

    if (!hasValidCredentials || !isValidToken(user?.fyersAccessToken)) {
      setIsOpen(false);
      setShowBrokerSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement strategy creation logic
      console.log("Creating strategy:", selectedStrategy);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close modal on success
      setIsOpen(false);
      setSelectedStrategy("");
    } catch (error) {
      console.error("Failed to create strategy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className="w-full">
              <BarChart3 className="mr-2 h-4 w-4" />
              Create New Strategy
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Strategy</DialogTitle>
            <DialogDescription>
              Select a trading strategy to implement. You can customize the
              parameters after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="strategy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Strategy Type
              </label>
              <Select
                value={selectedStrategy}
                onValueChange={setSelectedStrategy}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a trading strategy" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      <div className="flex flex-col items-start text-left min-w-0 w-full">
                        <span className="font-medium truncate w-full">
                          {strategy.label}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-2 w-full">
                          {strategy.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStrategy && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <h4 className="text-sm font-medium mb-2">Strategy Details</h4>
                <p className="text-xs text-muted-foreground">
                  {
                    strategies.find((s) => s.value === selectedStrategy)
                      ?.description
                  }
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedStrategy("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStrategy}
              disabled={!selectedStrategy || isLoading}
            >
              {isLoading ? "Creating..." : "Create Strategy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BrokerSettingsModal
        open={showBrokerSettings}
        onOpenChange={setShowBrokerSettings}
      />
    </>
  );
}
