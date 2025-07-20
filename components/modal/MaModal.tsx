"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { MaStrategyFormData, FormStep } from "@/types/modal";
import {
  MaModalStep1,
  MaModalStep2,
  MaModalStep3,
  MaModalStep4,
} from "../modal-steps/maModal/steps";
import {
  ALGO_STRATERGIES,
  INDEX_OPTIONS,
  SOURCE_OPTIONS,
  TIME_FRAME_OPTIONS,
} from "@/app/constant/constants";
import {
  MODAL_SLIDE_ANIMATION_VARIENT,
  MODAL_STEP_TRANSITION,
} from "@/app/constant/animation-constants";

// Main Modal Component
export default function MAStrategyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    setError,
  } = useForm<MaStrategyFormData>({
    defaultValues: {
      strategyName: ALGO_STRATERGIES[0].name,
      index: "",
      positionType: undefined,
      timeframe: "",
      movingAverageLength: "",
      source: "",
      stocksAllowed: "",
      priceRangeMin: "",
      priceRangeMax: "",
      riskManagementType: "percentage",
      stoplossRupees: "",
      stoplossPercentage: "",
      maxProfitRupees: "",
      maxProfitPercentage: "",
      squareOffBy310: true,
      termsAccepted: false,
      riskDisclosure: false,
    },
    mode: "all",
  });

  // Function to measure content height
  const measureContentHeight = () => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  };

  // Effect for window resize events
  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      measureContentHeight();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect for step changes
  useEffect(() => {
    let observer: MutationObserver | null = null;
    measureContentHeight();

    // Add a small delay to ensure content has rendered before measuring height again
    const timer = setTimeout(() => {
      measureContentHeight();
      if (contentRef.current) {
        observer = new MutationObserver(() => {
          requestAnimationFrame(measureContentHeight);
        });

        observer.observe(contentRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [currentStep]);

  const getMaxStocks = () => {
    const selectedIndex = INDEX_OPTIONS.find(
      (opt) => opt.value === watch("index")
    );
    return selectedIndex ? selectedIndex.maxStocks : 50;
  };

  const validateStep2Fields = async (): Promise<boolean> => {
    let hasValidationErrors = false;

    if (!watch("index") || watch("index") === "") {
      setError("index", {
        type: "required",
        message: "Index selection is required",
      });
      hasValidationErrors = true;
    }

    if (!watch("timeframe") || watch("timeframe") === "") {
      setError("timeframe", {
        type: "required",
        message: "Timeframe is required",
      });
      hasValidationErrors = true;
    }

    if (!watch("positionType")) {
      setError("positionType", {
        type: "required",
        message: "Position type is required",
      });
      hasValidationErrors = true;
    }

    if (!watch("source") || watch("source") === "") {
      setError("source", { type: "required", message: "Source is required" });
      hasValidationErrors = true;
    }

    return !hasValidationErrors;
  };

  const onSubmit = (data: MaStrategyFormData) => {
    console.log(data);
    setIsOpen(false);
  };

  const handleNext = async () => {
    const nextStep = currentStep + 1;
    if (nextStep >= totalSteps) return;

    // Determine which fields to validate based on the current step
    let fieldsToValidate: (keyof MaStrategyFormData)[] = [];

    // Step 1 validation (Strategy selection)
    if (currentStep === 0) {
      fieldsToValidate = ["strategyName"];
    }
    // Step 2 validation (Strategy parameters)
    else if (currentStep === 1) {
      fieldsToValidate = [
        "index",
        "positionType",
        "timeframe",
        "movingAverageLength",
        "source",
        "stocksAllowed",
      ];

      // Ensure these fields have validation rules
      register("index", {
        required: "Index selection is required",
      });

      register("timeframe", {
        required: "Timeframe is required",
      });

      register("source", {
        required: "Source is required",
      });
    }
    // Step 3 validation (Risk management)
    else if (currentStep === 2) {
      fieldsToValidate = ["riskManagementType"];

      const riskType = watch("riskManagementType");
      if (riskType === "percentage") {
        fieldsToValidate.push("stoplossPercentage", "maxProfitPercentage");
      } else {
        fieldsToValidate.push("stoplossRupees", "maxProfitRupees");
      }
    }
    // Step 4 validation (Terms)
    else if (currentStep === 3) {
      fieldsToValidate = ["termsAccepted", "riskDisclosure"];
    }

    const isValid = await trigger(fieldsToValidate);
    let canProceed = isValid;

    // Additional validation for step 1
    if (currentStep === 1) {
      const manualValidation = await validateStep2Fields();
      canProceed = isValid && manualValidation;
    }

    if (canProceed) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } else {
      console.log("Validation failed for fields:", fieldsToValidate);
    }
  };

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
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="min-w-6xl w-[80vw] h-auto max-h-[95vh] shadow-lg border-none rounded-2xl p-0 flex flex-col overflow-hidden"
        style={{
          height: contentHeight
            ? `${Math.min(contentHeight + 200, windowHeight * 0.95)}px`
            : "auto",
          transition: "height 0.15s ease-in-out",
        }}
      >
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Moving Average Strategy Setup
          </DialogTitle>
          <DialogDescription>
            Create your personalized moving average trading strategy with
            advanced configuration options.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-0 w-full flex-grow overflow-visible">
          <motion.div
            ref={contentRef}
            layout
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="mx-auto w-full rounded-xl shadow-lg flex flex-col overflow-visible border-none"
            style={{
              minHeight: "300px",
              height: "auto",
            }}
          >
            <div className="p-4 pb-0 flex-shrink-0">
              <SegmentedLoader
                currentStep={currentStep}
                totalSteps={totalSteps}
                height="h-2"
              />
            </div>
            <motion.div
              layout
              className="relative w-full"
              style={{ minHeight: "auto" }}
            >
              <AnimatePresence initial={false} custom={currentStep} mode="wait">
                <motion.div
                  layout
                  key={currentStep}
                  custom={currentStep}
                  variants={MODAL_SLIDE_ANIMATION_VARIENT}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={MODAL_STEP_TRANSITION}
                  className="w-full h-auto"
                >
                  {/* Step 1 */}
                  {currentStep === 0 && (
                    <MaModalStep1
                      strategies={ALGO_STRATERGIES}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  )}

                  {/* Step 2 */}
                  {currentStep === 1 && (
                    <MaModalStep2
                      strategies={ALGO_STRATERGIES}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      indexOptions={INDEX_OPTIONS}
                      timeframeOptions={TIME_FRAME_OPTIONS}
                      sourceOptions={SOURCE_OPTIONS}
                      getMaxStocks={getMaxStocks}
                    />
                  )}
                  {/* Step 3 */}
                  {currentStep === 2 && (
                    <MaModalStep3
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      strategies={ALGO_STRATERGIES}
                    />
                  )}
                  {/* Step 4 */}
                  {currentStep === 3 && (
                    <MaModalStep4
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      setIsOpen={setIsOpen}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
        <DialogFooter className="p-6 pt-4 border-t mt-auto flex-shrink-0">
          {currentStep > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep((prev) => Math.max(prev - 1, 0));
              }}
              className="mr-2"
            >
              Previous
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
          )}
          {currentStep !== totalSteps - 1 ? (
            <Button onClick={handleNext} className="disabled:opacity-50">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={
                !watch("termsAccepted") ||
                !watch("riskDisclosure") ||
                Object.keys(errors).length > 0
              }
              className="disabled:opacity-50"
              title={
                !watch("termsAccepted") || !watch("riskDisclosure")
                  ? "You must accept the terms and risk disclosure"
                  : ""
              }
            >
              Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
