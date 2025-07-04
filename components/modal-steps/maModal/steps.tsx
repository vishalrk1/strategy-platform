import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaStrategyFormData, Strategy } from "@/types/modal/maModal";
import { Checkbox } from "@radix-ui/react-checkbox";
import { AlertCircle, Check, FileText, Target } from "lucide-react";
import React from "react";

interface MaModalStep1Props {
  strategies: Strategy[];
  formData: MaStrategyFormData;
  updateFormData: (field: keyof MaStrategyFormData, value: string) => void;
}

interface MaModalStep2Props {
  strategies: Strategy[];
  formData: MaStrategyFormData;
  updateFormData: (field: keyof MaStrategyFormData, value: string) => void;
  indexOptions: { value: string; label: string; maxStocks: number }[];
  timeframeOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  getMaxStocks: () => number;
}

export function MaModalStep1({
  strategies,
  formData,
  updateFormData,
}: MaModalStep1Props) {
  return (
    <div className="flex flex-col gap-4 p-6 pb-6 w-full">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Choose Your Trading Strategy</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up your personalized trading strategy to start automated trading
        </p>
      </div>

      {/* Show strategy details based on selection */}
      {strategies.map(
        (strategy) =>
          formData.strategyName === strategy.name && (
            <div
              key={strategy.id}
              className={`${strategy.bgColor} p-4 rounded-lg border ${strategy.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div>
                  <h3 className={`font-semibold ${strategy.titleColor} mb-2`}>
                    {strategy.title}
                  </h3>
                  <p className={`text-sm ${strategy.textColor}`}>
                    {strategy.description}
                  </p>
                </div>
              </div>
            </div>
          )
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="strategyName" className="mb-3">
            Strategy Name
          </Label>
          <Select
            value={formData.strategyName}
            onValueChange={(value) => updateFormData("strategyName", value)}
          >
            <SelectTrigger className="mt-1" id="strategyName">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((strategy) => (
                <SelectItem key={strategy.id} value={strategy.name}>
                  {strategy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Select your strategy type
          </p>
        </div>
      </div>
    </div>
  );
}

export function MaModalStep2({
  formData,
  updateFormData,
  indexOptions,
  timeframeOptions,
  sourceOptions,
  getMaxStocks,
}: MaModalStep2Props) {
  return (
    <div className="flex flex-col gap-4 p-6 pb-6 w-full">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Configure Strategy Parameters</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up your index selection, position type, and technical parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Index Selection</Label>
          <Select
            value={formData.index}
            onValueChange={(value) => updateFormData("index", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {indexOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Position Type</Label>
          <Select
            value={formData.positionType}
            onValueChange={(value) => updateFormData("positionType", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intraday">Intraday</SelectItem>
              <SelectItem value="overnight">Overnight (CNC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Timeframe</Label>
          <Select
            value={formData.timeframe}
            onValueChange={(value) => updateFormData("timeframe", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(formData.positionType === "overnight"
                ? [{ value: "day", label: "Day" }]
                : timeframeOptions
              ).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Moving Average Length</Label>
          <Input
            type="number"
            value={formData.movingAverageLength}
            onChange={(e) =>
              updateFormData("movingAverageLength", e.target.value)
            }
            className="mt-1"
            min="1"
            max="200"
          />
        </div>

        <div>
          <Label>Source</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => updateFormData("source", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Number of Stocks Allowed</Label>
          <Input
            type="number"
            value={formData.stocksAllowed}
            onChange={(e) => updateFormData("stocksAllowed", e.target.value)}
            className="mt-1"
            min="1"
            max={getMaxStocks()}
          />
          <p className="text-sm text-gray-500 mt-1">
            Max: {getMaxStocks()} stocks for{" "}
            {indexOptions.find((opt) => opt.value === formData.index)?.label}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Label>Stock Price Range (Optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min Price (₹)"
            value={formData.priceRangeMin}
            onChange={(e) => updateFormData("priceRangeMin", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price (₹)"
            value={formData.priceRangeMax}
            onChange={(e) => updateFormData("priceRangeMax", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function MaModalStep3({
  formData,
  updateFormData,
}: {
  formData: MaStrategyFormData;
  updateFormData: (field: keyof MaStrategyFormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-6 pb-6 w-full">
      <div className="text-center mb-4">
        <Target className="mx-auto h-12 w-12 text-green-500 mb-2" />
        <h2 className="text-2xl font-bold">Risk Management & Targets</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure your stop loss, targets, and exit strategy
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Stop Loss Configuration</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="stoploss-percentage"
                name="stoplossType"
                value="percentage"
                checked={formData.stoplossType === "percentage"}
                onChange={(e) => updateFormData("stoplossType", e.target.value)}
              />
              <Label htmlFor="stoploss-percentage">Percentage (%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="stoploss-rupees"
                name="stoplossType"
                value="rupees"
                checked={formData.stoplossType === "rupees"}
                onChange={(e) => updateFormData("stoplossType", e.target.value)}
              />
              <Label htmlFor="stoploss-rupees">Rupees (₹)</Label>
            </div>
          </div>

          {formData.stoplossType === "percentage" ? (
            <Input
              type="number"
              placeholder="Enter percentage (0-100)"
              value={formData.stoplossPercentage}
              onChange={(e) =>
                updateFormData("stoplossPercentage", e.target.value)
              }
              className="mt-2"
              min="0"
              max="100"
              step="0.1"
            />
          ) : (
            <Input
              type="number"
              placeholder="Enter amount in rupees"
              value={formData.stoplossRupees}
              onChange={(e) => updateFormData("stoplossRupees", e.target.value)}
              className="mt-2"
              min="0"
              step="1"
            />
          )}
        </div>
        <div>
          <Label>Square Off by 3:10 PM</Label>
          <Select
            value={formData.squareOffBy310}
            onValueChange={(value) => updateFormData("squareOffBy310", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Avoid auto square-off charges by broker
          </p>
        </div>
      </div>
    </div>
  );
}

export function MaModalStep4({
  formData,
  updateFormData,
  setIsOpen,
}: {
  formData: MaStrategyFormData;
  updateFormData: (
    field: keyof MaStrategyFormData,
    value: string | boolean
  ) => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-6 pb-6 w-full">
      <div className="text-center mb-4">
        <FileText className="mx-auto h-12 w-12 text-orange-500 mb-2" />
        <h2 className="text-2xl font-bold">Terms & Confirmation</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review your strategy and accept terms to proceed
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                updateFormData("termsAccepted", checked)
              }
            />
            <div className="text-sm leading-relaxed">
              <Label htmlFor="terms" className="cursor-pointer">
                I accept the{" "}
                <span className="text-blue-600 underline">
                  Terms and Conditions
                </span>{" "}
                and understand that trading involves risk. I am responsible for
                all trading decisions made by this strategy.
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="risk"
              checked={formData.riskDisclosure}
              onCheckedChange={(checked) =>
                updateFormData("riskDisclosure", checked)
              }
            />
            <div className="text-sm leading-relaxed">
              <Label htmlFor="risk" className="cursor-pointer">
                I acknowledge the{" "}
                <span className="text-blue-600 underline">Risk Disclosure</span>{" "}
                and understand that past performance does not guarantee future
                results. I can afford potential losses.
              </Label>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Important Notice:</p>
              <p>
                This strategy will execute trades automatically based on your
                configuration. Ensure you have sufficient funds and monitor your
                positions regularly.
              </p>
            </div>
          </div>
        </div>

        {formData.termsAccepted && formData.riskDisclosure && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Ready to deploy your Moving Average Strategy!
              </span>
            </div>
          </motion.div>
        )}

        <Button
          className="w-full mt-4"
          disabled={!formData.termsAccepted || !formData.riskDisclosure}
          onClick={() => {
            alert("Strategy created successfully!");
            setIsOpen(false);
          }}
        >
          Create Strategy
        </Button>
      </div>
    </div>
  );
}
