"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SegmentedLoader } from "@/components/ui/SegmentLoader";
import {
  Strategy,
  IndexOption,
  TimeframeOption,
  SourceOption,
  MaStrategyFormData,
  FormStep,
} from "@/types/modal";
import {
  MaModalStep1,
  MaModalStep2,
  MaModalStep3,
  MaModalStep4,
} from "../modal-steps/maModal/steps";

// Main Progress Card Component
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// Main Modal Component
export default function MAStrategyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(0);

  // Define strategies with their details
  const strategies: Strategy[] = [
    {
      id: "ma-strategy",
      name: "MA Strategy",
      title: "Moving Average Strategy",
      description:
        "This strategy uses moving averages to identify trend direction and generate buy/sell signals. Perfect for both intraday and overnight positions with customizable risk management.",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
      titleColor: "text-blue-900 dark:text-blue-100",
    },
    {
      id: "hammer-strategy",
      name: "Hammer Strategy",
      title: "Hammer Candlestick Strategy",
      description:
        "This strategy identifies hammer candlestick patterns to spot potential reversals and generate trade signals. Suitable for traders looking for price action-based entries.",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
      titleColor: "text-blue-900 dark:text-blue-100",
    },
  ];

  const [formData, setFormData] = useState<MaStrategyFormData>({
    // Step 1: Strategy Name
    strategyName: strategies[0].name,

    // Step 2: Basic Configuration
    index: "nifty50",
    positionType: "intraday",
    timeframe: "15",
    movingAverageLength: "9",
    source: "close",
    stocksAllowed: "5",
    priceRangeMin: "",
    priceRangeMax: "",

    // Step 3: Risk Management & Targets
    stoplossType: "percentage",
    stoplossRupees: "",
    stoplossPercentage: "2",
    squareOffBy310: "yes",
    exitQty1: "",
    exitQty2: "",
    exitQty3: "",
    exitQty4: "",
    target1: "",
    target2: "",
    target3: "",
    target4: "",

    // Step 4: Terms
    termsAccepted: false,
    riskDisclosure: false,
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const indexOptions: IndexOption[] = [
    { value: "nifty50", label: "Nifty 50", maxStocks: 50 },
    { value: "niftynext50", label: "Nifty Next 50", maxStocks: 50 },
    { value: "nifty100", label: "Nifty 100", maxStocks: 100 },
    { value: "nifty200", label: "Nifty 200", maxStocks: 200 },
    { value: "nifty500", label: "Nifty 500", maxStocks: 500 },
  ];

  const timeframeOptions: TimeframeOption[] = [
    { value: "5", label: "5 Minutes" },
    { value: "15", label: "15 Minutes" },
    { value: "30", label: "30 Minutes" },
    { value: "60", label: "1 Hour" },
    { value: "120", label: "2 Hours" },
    { value: "180", label: "3 Hours" },
    { value: "day", label: "Day" },
  ];

  const sourceOptions: SourceOption[] = [
    { value: "open", label: "Open" },
    { value: "high", label: "High" },
    { value: "low", label: "Low" },
    { value: "close", label: "Close" },
  ];

  const getMaxStocks = () => {
    const selectedIndex = indexOptions.find(
      (opt) => opt.value === formData.index
    );
    return selectedIndex ? selectedIndex.maxStocks : 50;
  };

  const totalSteps = 4;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
        >
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="ml-2">Create New Strategy</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-6xl w-[80vw] max-h-[95vh] shadow-lg border-none rounded-2xl p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Moving Average Strategy Setup
          </DialogTitle>
          <DialogDescription>
            Create your personalized moving average trading strategy with
            advanced configuration options.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-0 w-full flex-grow overflow-y-auto">
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mx-auto w-full rounded-xl shadow-lg flex flex-col overflow-hidden border-none"
          >
            <div className="p-4 flex-shrink-0">
              <SegmentedLoader
                currentStep={currentStep}
                totalSteps={totalSteps}
                height="h-2"
              />
            </div>
            <motion.div
              layout
              className="relative flex-grow"
              style={{ minHeight: "auto" }}
            >
              <AnimatePresence
                initial={false}
                custom={currentStep}
                mode="popLayout"
              >
                <motion.div
                  layout
                  key={currentStep}
                  custom={currentStep}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    layout: {
                      duration: 0.3,
                      ease: "easeInOut",
                    },
                    x: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.1,
                    },
                    opacity: { duration: 0.1 },
                  }}
                  className="w-full"
                >
                  {/* Step 1 */}
                  {currentStep === 0 && (
                    <MaModalStep1
                      strategies={strategies}
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}

                  {/* Step 2 */}
                  {currentStep === 1 && (
                    <MaModalStep2
                      strategies={strategies}
                      formData={formData}
                      updateFormData={updateFormData}
                      indexOptions={indexOptions}
                      timeframeOptions={timeframeOptions}
                      sourceOptions={sourceOptions}
                      getMaxStocks={getMaxStocks}
                    />
                  )}
                  {/* Step 3 */}
                  {currentStep === 2 && (
                    <MaModalStep3
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {/* Step 4 */}
                  {currentStep === 3 && (
                    <MaModalStep4
                      formData={formData}
                      updateFormData={updateFormData}
                      setIsOpen={setIsOpen}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
        <DialogFooter className="p-6 pt-4 border-t mt-auto flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
            }
            disabled={currentStep === totalSteps - 1}
            className="disabled:opacity-50"
          >
            {currentStep === totalSteps - 1 ? "Complete" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
