import React from "react";
import { cn } from "utils/cn";

export interface Props {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  message?: string;
  variant?: "prime" | "longevity" | "neutral";
  className?: string;
}

/**
 * Neo-brutalist loading indicator
 * Can be used inline or as a full-page overlay
 */
export function LoadingIndicator({
  size = "md",
  fullPage = false,
  message = "Loading...",
  variant = "prime",
  className
}: Props) {
  // Size configurations
  const sizeConfig = {
    sm: {
      outer: "w-16 h-16",
      inner: "w-8 h-8",
      text: "text-xs"
    },
    md: {
      outer: "w-24 h-24",
      inner: "w-12 h-12",
      text: "text-sm"
    },
    lg: {
      outer: "w-32 h-32",
      inner: "w-16 h-16",
      text: "text-base"
    }
  };
  
  // Variant configuration
  const variantConfig = {
    prime: {
      bg: "border-indigo-500/30 bg-indigo-500/5",
      inner: "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]",
      text: "text-indigo-400"
    },
    longevity: {
      bg: "border-pink-500/30 bg-pink-500/5",
      inner: "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
      text: "text-pink-400"
    },
    neutral: {
      bg: "border-slate-600/30 bg-slate-800/50",
      inner: "border-slate-500",
      text: "text-slate-400"
    }
  };
  
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={cn(
        "relative flex items-center justify-center border-2 animate-pulse",
        sizeConfig[size].outer,
        variantConfig[variant].bg
      )}>
        <div className={cn(
          "border-2 animate-spin",
          sizeConfig[size].inner,
          variantConfig[variant].inner
        )} />
      </div>
      
      {message && (
        <div className={cn(
          "mt-4 font-mono font-bold",
          sizeConfig[size].text,
          variantConfig[variant].text
        )}>
          {message}
        </div>
      )}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className={cn(
        "fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50",
        className
      )}>
        {spinner}
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-center justify-center p-4",
      className
    )}>
      {spinner}
    </div>
  );
}
