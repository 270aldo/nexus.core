import React from "react";
import { cn } from "utils/cn";

export interface Props {
  status: "active" | "paused" | "inactive" | "success" | "warning" | "danger" | "info" | "prime" | "longevity";
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Status badge component with neo-brutalist styling
 * Used to display status labels like active, paused, inactive, etc.
 */
export function StatusBadge({ status, label, className, size = "md" }: Props) {
  // Status colors and labels
  const statusConfig = {
    active: { color: "bg-emerald-500", textColor: "text-white", label: "Active" },
    paused: { color: "bg-amber-500", textColor: "text-white", label: "Paused" },
    inactive: { color: "bg-slate-500", textColor: "text-white", label: "Inactive" },
    success: { color: "bg-emerald-500", textColor: "text-white", label: "Success" },
    warning: { color: "bg-amber-500", textColor: "text-white", label: "Warning" },
    danger: { color: "bg-red-500", textColor: "text-white", label: "Danger" },
    info: { color: "bg-sky-500", textColor: "text-white", label: "Info" },
    prime: { color: "bg-indigo-500", textColor: "text-white", label: "PRIME" },
    longevity: { color: "bg-pink-500", textColor: "text-white", label: "LONGEVITY" }
  };
  
  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "font-mono font-bold border-2 border-neutral-900 inline-flex items-center justify-center",
      config.color,
      config.textColor,
      sizeClasses[size],
      className
    )}>
      {label || config.label}
    </div>
  );
}
