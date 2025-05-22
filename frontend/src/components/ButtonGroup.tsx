import React, { ReactNode } from "react";
import { cn } from "utils/cn";

export interface Props {
  children: ReactNode;
  className?: string;
  variant?: "default" | "prime" | "longevity" | "outline";
  vertical?: boolean;
  compact?: boolean;
}

/**
 * Neo-brutalist button group component
 * Groups related buttons together with consistent styling
 */
export function ButtonGroup({ 
  children, 
  className, 
  variant = "default", 
  vertical = false, 
  compact = false 
}: Props) {
  // Variant styles
  const variantClasses = {
    default: "bg-card border-border",
    prime: "bg-indigo-500/10 border-indigo-500/30",
    longevity: "bg-pink-500/10 border-pink-500/30",
    outline: "bg-transparent border-border"
  };
  
  return (
    <div className={cn(
      "border inline-flex",
      vertical ? "flex-col" : "flex-row",
      compact ? "p-0" : "p-1",
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
}
