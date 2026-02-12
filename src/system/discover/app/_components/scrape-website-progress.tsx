"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Circle } from "lucide-react";

const STEPS = [
  "Fetching data from the site",
  "Finding content",
  "Checking and finding",
] as const;

type ScrapeWebsiteProgressProps = {
  isLoading: boolean;
  className?: string;
};

export function ScrapeWebsiteProgress({
  isLoading,
  className = "",
}: ScrapeWebsiteProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStepIndex(0);
      return;
    }
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const displayStep = isLoading ? Math.min(stepIndex, STEPS.length - 1) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin shrink-0" />
        ) : (
          <Circle className="h-5 w-5 shrink-0" />
        )}
        <span className="text-sm font-medium">
          {STEPS[displayStep]}
          {isLoading && "..."}
        </span>
      </div>
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= displayStep
                ? "bg-primary"
                : "bg-muted"
            } ${i === displayStep && isLoading ? "animate-pulse" : ""}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {STEPS.map((label, i) => (
          <span
            key={i}
            className={
              i <= displayStep ? "text-foreground font-medium" : undefined
            }
          >
            {i === 0 && "Fetch"}
            {i === 1 && "Find"}
            {i === 2 && "Check"}
          </span>
        ))}
      </div>
    </div>
  );
}
