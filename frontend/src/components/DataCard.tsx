import React from "react";
import { cn } from "utils/cn";

export interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  accent?: "prime" | "longevity" | "success" | "warning" | "danger" | "neutral";
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

/**
 * Data metric card with neo-brutalist styling
 * Displays a key metric with optional trend indicator and accent color
 */
export function DataCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  accent = "neutral",
  className,
  isLoading = false,
  onClick
}: Props) {
  // Accent border colors
  const accentClasses = {
    prime: "border-l-indigo-500 glow-prime",
    longevity: "border-l-pink-500 glow-longevity",
    success: "border-l-emerald-500 glow-success",
    warning: "border-l-amber-500 glow-warning",
    danger: "border-l-red-500 glow-danger",
    neutral: "border-l-slate-600"
  };
  
  // Text glow effects
  const textGlowClasses = {
    prime: "text-glow-prime",
    longevity: "text-glow-longevity",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
    neutral: ""
  };
  
  // Trend indicator colors
  const trendColorClass = trend?.isPositive ? "text-emerald-500" : "text-red-500";
  
  return (
    <div 
      className={cn(
        "bg-slate-800/50 border-2 border-slate-700 border-l-4 p-4 rounded-sm",
        accentClasses[accent],
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-mono tracking-tight text-slate-400">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse bg-slate-700 rounded mt-2"></div>
      ) : (
        <div className={cn("text-3xl font-bold font-mono mt-2", textGlowClasses[accent])}>
          {value}
        </div>
      )}
      
      <div className="mt-1 flex items-center text-xs font-mono">
        {trend && (
          <span className={cn("mr-1 flex items-center", trendColorClass)}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
        <span className="text-slate-400">{subtitle || (trend?.label || '')}</span>
      </div>
    </div>
  );
}
