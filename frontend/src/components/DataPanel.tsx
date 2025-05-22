import React from "react";
import { cn } from "utils/cn";

export interface Props {
  children: React.ReactNode;
  className?: string;
  accent?: "prime" | "longevity" | "neutral" | "success" | "danger";
  glowEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

/**
 * Data display panel with neo-brutalist styling
 * Used for containing data visualizations or content sections
 */
export function DataPanel({ 
  children, 
  className, 
  accent = "neutral",
  glowEffect = false,
  padding = "md",
  onClick
}: Props) {
  // Accent styles
  const accentClasses = {
    prime: "border-indigo-500",
    longevity: "border-pink-500",
    success: "border-emerald-500",
    danger: "border-red-500",
    neutral: "border-slate-600"
  };
  
  // Glow effect styles
  const glowClasses = {
    prime: "shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    longevity: "shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    success: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    danger: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    neutral: ""
  };
  
  // Padding styles
  const paddingClasses = {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6"
  };
  
  return (
    <div 
      className={cn(
        "bg-background border-2 border-border border-l-4",
        accentClasses[accent],
        glowEffect && glowClasses[accent],
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-grow overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
