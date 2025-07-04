import { motion } from "framer-motion";

interface SegmentedLoaderProps {
  currentStep: number;
  totalSteps: number;
  height?: string;
}

export function SegmentedLoader({
  currentStep,
  totalSteps,
  height = "h-2",
}: SegmentedLoaderProps) {
  return (
    <div className="w-full">
      <div className="flex gap-1">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={`progress-${index}`}
            className={`flex-1 ${height} overflow-hidden rounded-full bg-[#222222]`}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: index <= currentStep ? "100%" : "0%",
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="h-full bg-gray-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
