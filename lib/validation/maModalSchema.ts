import { z } from "zod";

// Schema for the entire form
export const maStrategyFormSchema = z.object({
  // Step 1: Strategy Selection
  strategyName: z.string().min(1, "Strategy name is required"),

  // Step 2: Basic Configuration
  index: z.string().min(1, "Index selection is required"),
  positionType: z.enum(["intraday", "overnight"], {
    required_error: "Position type is required",
  }),
  timeframe: z.string().min(1, "Timeframe is required"),
  movingAverageLength: z
    .string()
    .min(1, "Moving average length is required")
    .refine(
      (val: string) =>
        !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 200,
      {
        message: "Moving average length must be between 1 and 200",
      }
    ),
  source: z.string().min(1, "Source is required"),
  stocksAllowed: z
    .string()
    .min(1, "Number of stocks allowed is required")
    .refine((val: string) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Number of stocks allowed must be greater than 0",
    }),
  priceRangeMin: z
    .string()
    .optional()
    .refine((val: string | undefined) => !val || !isNaN(Number(val)), {
      message: "Min price must be a number",
    }),
  priceRangeMax: z
    .string()
    .optional()
    .refine((val: string | undefined) => !val || !isNaN(Number(val)), {
      message: "Max price must be a number",
    }),

  // Step 3: Risk Management
  riskManagementType: z.enum(["percentage", "rupees"], {
    required_error: "Risk management type is required",
  }),
  stoplossRupees: z.string()
    .min(1, "Stoploss must be provided")
    .refine((val: string) => !isNaN(Number(val)) && Number(val) >= 10, {
      message: "Stoploss must be at least 10 rupees",
    }),
  stoplossPercentage: z.string()
    .min(1, "Stoploss percentage must be provided")
    .refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0.01, {
      message: "Stoploss percentage must be at least 0.01%",
    }),
  maxProfitRupees: z.string()
    .min(1, "Max profit must be provided")
    .refine((val: string) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: "Max profit must be at least 1 rupee",
    }),
  maxProfitPercentage: z.string()
    .min(1, "Max profit percentage must be provided")
    .refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0.01, {
      message: "Max profit percentage must be at least 0.01%",
    }),
  squareOffBy310: z.boolean().optional().default(true),

  // Step 4: Terms
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  riskDisclosure: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the risk disclosure",
  }),
});

export type MaStrategyFormValues = z.infer<typeof maStrategyFormSchema>;

// Validation schemas by step
export const stepValidationSchemas = [
  // Step 1
  z.object({
    strategyName: maStrategyFormSchema.shape.strategyName,
  }),
  // Step 2
  z.object({
    index: maStrategyFormSchema.shape.index,
    positionType: maStrategyFormSchema.shape.positionType,
    timeframe: maStrategyFormSchema.shape.timeframe,
    movingAverageLength: maStrategyFormSchema.shape.movingAverageLength,
    source: maStrategyFormSchema.shape.source,
    stocksAllowed: maStrategyFormSchema.shape.stocksAllowed,
    priceRangeMin: maStrategyFormSchema.shape.priceRangeMin,
    priceRangeMax: maStrategyFormSchema.shape.priceRangeMax,
  }),
  // Step 3
  z.object({
    riskManagementType: maStrategyFormSchema.shape.riskManagementType,
    stoplossRupees: maStrategyFormSchema.shape.stoplossRupees,
    stoplossPercentage: maStrategyFormSchema.shape.stoplossPercentage,
    maxProfitRupees: maStrategyFormSchema.shape.maxProfitRupees,
    maxProfitPercentage: maStrategyFormSchema.shape.maxProfitPercentage,
    squareOffBy310: maStrategyFormSchema.shape.squareOffBy310,
  }),
  // Step 4
  z.object({
    termsAccepted: maStrategyFormSchema.shape.termsAccepted,
    riskDisclosure: maStrategyFormSchema.shape.riskDisclosure,
  }),
];
