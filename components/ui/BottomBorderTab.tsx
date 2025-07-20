"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";

interface Tab {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface BottomBorderTabProps {
  tabs: Tab[];
  className?: string;
  borderColor?: string;
  initialTabId?: string;
  activeTabClass?: string;
  inactiveTabClass?: string;
}

const BottomBorderTab: React.FC<BottomBorderTabProps> = ({
  tabs,
  initialTabId,
  className,
  borderColor = "bg-blue-500",
  activeTabClass = "text-white border-b-2 border-primary dark:text-primary-foreground dark:border-primary",
  inactiveTabClass = "text-primary dark:text-primary-foreground/60",
}) => {
  const defaultTabId = initialTabId || tabs[0].id;
  const [activeTab, setActiveTab] = useState(defaultTabId);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(
    tabs.findIndex((tab) => tab.id === defaultTabId)
  );
  const [sliderWidth, setSliderWidth] = useState<number>(0);
  const [sliderOffset, setSliderOffset] = useState<number>(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Add a flag to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setTabRef = (index: number) => (el: HTMLButtonElement | null) => {
    tabRefs.current[index] = el;
  };

  const isUpdatingRef = useRef(false);

  useLayoutEffect(() => {
    if (!isClient || isUpdatingRef.current) return;

    const activeTabElement = tabRefs.current[activeTabIndex];
    if (activeTabElement) {
      isUpdatingRef.current = true;

      try {
        const parent = activeTabElement.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        const newWidth = tabRect.width;
        const newOffset = tabRect.left - (parentRect?.left || 0);

        if (
          Math.abs(sliderWidth - newWidth) > 0.1 ||
          Math.abs(sliderOffset - newOffset) > 0.1
        ) {
          setSliderWidth(newWidth);
          setSliderOffset(newOffset);
        }
      } finally {
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    }
  }, [activeTabIndex, tabs.length, sliderWidth, sliderOffset, isClient]);

  return (
    <div className={`flex flex-col items-start ${className || ""}`}>
      <div className="relative flex rounded-t-xl min-w-[220px] max-w-fit border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            ref={setTabRef(index)}
            className={`px-4 py-2 font-medium text-sm md:text-xl transition-colors duration-200 focus:outline-none ${
              activeTab === tab.id ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => {
              // Only update if the tab is changing
              if (activeTab !== tab.id) {
                setActiveTab(tab.id);
                setActiveTabIndex(index);
              }
            }}
          >
            {tab.title}
          </button>
        ))}
        {isClient && (
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 ${borderColor}`}
            initial={false}
            animate={{
              width: sliderWidth,
              x: sliderOffset,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        {isClient ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="my-4 flex w-full flex-col gap-10 p-4"
          >
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </motion.div>
        ) : (
          <div className="my-4 flex w-full flex-col gap-10 p-4">
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BottomBorderTab;
