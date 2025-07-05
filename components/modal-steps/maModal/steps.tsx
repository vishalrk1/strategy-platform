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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaStrategyFormData, Strategy } from "@/types/modal/maModal";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check } from "lucide-react";
import React from "react";

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";

interface MaModalStep1Props {
  strategies: Strategy[];
  register: UseFormRegister<MaStrategyFormData>;
  errors: FieldErrors<MaStrategyFormData>;
  watch: UseFormWatch<MaStrategyFormData>;
  setValue?: UseFormSetValue<MaStrategyFormData>;
}

interface MaModalStep2Props {
  strategies: Strategy[];
  register: UseFormRegister<MaStrategyFormData>;
  errors: FieldErrors<MaStrategyFormData>;
  watch: UseFormWatch<MaStrategyFormData>;
  setValue?: UseFormSetValue<MaStrategyFormData>;
  indexOptions: { value: string; label: string; maxStocks: number }[];
  timeframeOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  getMaxStocks: () => number;
}

export interface MaModalStep4Props {
  register: UseFormRegister<MaStrategyFormData>;
  errors: FieldErrors<MaStrategyFormData>;
  watch: UseFormWatch<MaStrategyFormData>;
  setValue: UseFormSetValue<MaStrategyFormData>;
  setIsOpen: (isOpen: boolean) => void;
}

export function StageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function MaModalStep1({
  strategies,
  errors,
  watch,
  setValue,
}: MaModalStep1Props) {
  const strategyName = watch("strategyName");
  return (
    <div className="flex flex-col gap-4 p-6 w-full min-h-[300px]">
      <StageTitle
        title="Choose Your Trading Strategy"
        description="Set up your personalized trading strategy to start automated trading"
      />

      {/* Show strategy details based on selection */}
      {strategies.map(
        (strategy) =>
          strategyName === strategy.name && (
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
            value={strategyName}
            onValueChange={(value) =>
              setValue && setValue("strategyName", value)
            }
          >
            <SelectTrigger className="mt-1" id="strategyName">
              <SelectValue placeholder="Select a strategy" />
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
          {errors.strategyName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.strategyName.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MaModalStep2({
  register,
  errors,
  watch,
  setValue,
  indexOptions,
  timeframeOptions,
  sourceOptions,
  getMaxStocks,
}: MaModalStep2Props) {
  const index = watch("index");
  const positionType = watch("positionType");
  const timeframe = watch("timeframe");
  const movingAverageLength = watch("movingAverageLength");
  const source = watch("source");
  const stocksAllowed = watch("stocksAllowed");
  const priceRangeMin = watch("priceRangeMin");
  const priceRangeMax = watch("priceRangeMax");

  return (
    <div className="flex flex-col gap-4 p-6 w-full min-h-[300px]">
      <StageTitle
        title="Configure Strategy Parameters"
        description="Set up your index selection, position type, and technical parameters"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="mb-2">Index Selection</Label>
          <Select
            value={index}
            onValueChange={(value) => setValue && setValue("index", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select an index" />
            </SelectTrigger>
            <SelectContent>
              {indexOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.index && (
            <p className="text-sm text-red-500 mt-1">{errors.index.message || "Index selection is required"}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">Position Type</Label>
          <Select
            value={positionType}
            onValueChange={(value) =>
              setValue &&
              setValue("positionType", value as "intraday" | "overnight")
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select position type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intraday">Intraday</SelectItem>
              <SelectItem value="overnight">Overnight (CNC)</SelectItem>
            </SelectContent>
          </Select>
          {errors.positionType && (
            <p className="text-sm text-red-500 mt-1">
              {errors.positionType.message || "Position type is required"}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2">Timeframe</Label>
          <Select
            value={timeframe}
            onValueChange={(value) => setValue && setValue("timeframe", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {(positionType === "overnight"
                ? [{ value: "day", label: "Day" }]
                : timeframeOptions
              ).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeframe && (
            <p className="text-sm text-red-500 mt-1">
              {errors.timeframe.message || "Timeframe is required"}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2">Moving Average Length</Label>
          <Input
            type="number"
            placeholder="Enter MA length (1-200)"
            value={movingAverageLength}
            {...register("movingAverageLength", {
              required: "Moving average length is required.",
            })}
            className="mt-1"
            min="1"
            max="200"
          />
          {errors.movingAverageLength && (
            <p className="text-sm text-red-500 mt-1">
              {errors.movingAverageLength.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2">Source</Label>
          <Select
            value={source}
            onValueChange={(value) => setValue && setValue("source", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select price source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.source && (
            <p className="text-sm text-red-500 mt-1">{errors.source.message || "Source is required"}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">Number of Stocks Allowed</Label>
          <Input
            type="number"
            placeholder="Enter number of stocks"
            value={stocksAllowed}
            {...register("stocksAllowed", {
              required: "Number of stocks allowed is required.",
            })}
            className="mt-1"
            min="1"
            max={getMaxStocks()}
          />
          {errors.stocksAllowed && (
            <p className="text-sm text-red-500 mt-1">
              {errors.stocksAllowed.message}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Max: {getMaxStocks()} stocks for{" "}
            {indexOptions.find((opt) => opt.value === index)?.label}
          </p>
        </div>
      </div>
      <div>
        <Label>Stock Price Range (Optional)</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min Price (₹)"
            value={priceRangeMin}
            {...register("priceRangeMin")}
          />
          <Input
            type="number"
            placeholder="Max Price (₹)"
            value={priceRangeMax}
            {...register("priceRangeMax")}
          />
        </div>
      </div>
    </div>
  );
}

export interface MaModalStep3Props extends MaModalStep1Props {
  setValue: UseFormSetValue<MaStrategyFormData>;
}

export function MaModalStep3({
  register,
  errors,
  watch,
  setValue,
}: MaModalStep3Props) {
  const riskManagementType = watch("riskManagementType");
  const stoplossPercentage = watch("stoplossPercentage");
  const maxProfitPercentage = watch("maxProfitPercentage");
  const stoplossRupees = watch("stoplossRupees");
  const maxProfitRupees = watch("maxProfitRupees");

  return (
    <div className="flex flex-col gap-2 p-6 w-full min-h-[300px]">
      <StageTitle
        title="Risk Management & Targets"
        description="Configure your stop profit and loss settings, and exit strategy"
      />
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-1">Important Notice</p>
          <ul className="list-disc list-inside gap-1">
            <li className="mb-1">
              Ensure your stop loss and profit targets are set according to your
              risk tolerance. These settings will automatically trigger trades
              based conditions.
            </li>
            <li>
              The strategy will exit all positions automatically when the
              specified profit or loss is reached. set your targets wisely.
            </li>
          </ul>
        </div>
      </div>
      <div className="space-y-1 grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-4 gap-y-2">
        {riskManagementType === "percentage" ? (
          <>
            <div>
              <Label>Stop Loss Configuration</Label>
              <Input
                type="number"
                placeholder="Enter percentage (0-100)"
                value={stoplossPercentage}
                {...register("stoplossPercentage", {
                  required: "Stop loss percentage is required.",
                })}
                className="mt-2"
                min="0"
                max="100"
                step="0.1"
              />
              {errors.stoplossPercentage && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.stoplossPercentage.message}
                </p>
              )}
            </div>
            <div>
              <Label>Maximum Profit Target</Label>
              <Input
                type="number"
                placeholder="Enter percentage (0-100)"
                value={maxProfitPercentage}
                {...register("maxProfitPercentage", {
                  required: "Max profit percentage is required.",
                })}
                className="mt-2"
                min="0"
                max="100"
                step="0.1"
              />
              {errors.maxProfitPercentage && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.maxProfitPercentage.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Stop Loss Configuration (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount in rupees"
                value={stoplossRupees}
                {...register("stoplossRupees", {
                  required: "Stop loss amount is required.",
                })}
                className="mt-2"
                min="0"
                step="1"
              />
              {errors.stoplossRupees && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.stoplossRupees.message}
                </p>
              )}
            </div>
            <div>
              <Label>Maximum Profit Target (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount in rupees"
                value={maxProfitRupees}
                {...register("maxProfitRupees", {
                  required: "Max profit amount is required.",
                })}
                className="mt-2"
                min="0"
                step="1"
              />
              {errors.maxProfitRupees && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.maxProfitRupees.message}
                </p>
              )}
            </div>
          </>
        )}
        <div>
          <Label className="mb-2">
            Risk Management Type
          </Label>
          <RadioGroup
            className="flex gap-4"
            value={riskManagementType}
            onValueChange={(value) =>
              setValue("riskManagementType", value as "percentage" | "rupees")
            }
          >
            <div className="flex items-center space-x-2 border rounded-md px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
              <RadioGroupItem
                value="rupees"
                id="stoploss-rupees"
                className="border-green-500 text-green-600 focus-visible:ring-green-500/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label htmlFor="stoploss-rupees" className="cursor-pointer">
                Rupees (₹)
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
              <RadioGroupItem
                value="percentage"
                id="stoploss-percentage"
                className="border-green-500 text-green-600 focus-visible:ring-green-500/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label htmlFor="stoploss-percentage" className="cursor-pointer">
                Percentage (%)
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="squareOffBy310"
            checked={watch("squareOffBy310")}
            onCheckedChange={(checked) => setValue("squareOffBy310", !!checked)}
          />
          <Label htmlFor="squareOffBy310" className="cursor-pointer">
            Square off all positions by 3:10 PM
          </Label>
        </div>
      </div>
    </div>
  );
}

export function MaModalStep4({
  errors,
  watch,
  setValue,
  setIsOpen,
}: MaModalStep4Props) {
  const termsAccepted = watch("termsAccepted");
  const riskDisclosure = watch("riskDisclosure");

  return (
    <div className="flex flex-col gap-4 p-6 w-full min-h-[300px]">
      <StageTitle
        title="Terms & Confirmation"
        description="Review your strategy and accept terms to proceed"
      />
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

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setValue("termsAccepted", !!checked)
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
            {errors.termsAccepted && (
              <p className="text-sm text-red-500 mt-1">
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="risk"
              checked={riskDisclosure}
              onCheckedChange={(checked) =>
                setValue("riskDisclosure", !!checked)
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
            {errors.riskDisclosure && (
              <p className="text-sm text-red-500 mt-1">
                {errors.riskDisclosure.message}
              </p>
            )}
          </div>
        </div>
        {termsAccepted && riskDisclosure && (
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
          disabled={!termsAccepted || !riskDisclosure}
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
