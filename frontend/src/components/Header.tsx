import React from "react";
import { Button } from "@/components/ui/button";

export interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  accentColor?: "prime" | "longevity" | "neutral";
}

/**
 * Neo-brutalist page header with title, subtitle and optional action buttons
 */
export function Header({ 
  title, 
  subtitle, 
  actions, 
  className = "", 
  accentColor = "neutral" 
}: Props) {
  // Define accent colors and shadow styles based on accent type
  const accentStyles = {
    prime: {
      border: "border-indigo-500",
      shadow: "shadow-[0_0_10px_rgba(99,102,241,0.3)]"
    },
    longevity: {
      border: "border-pink-500",
      shadow: "shadow-[0_0_10px_rgba(236,72,153,0.3)]"
    },
    neutral: {
      border: "border-slate-600",
      shadow: ""
    }
  };
  
  return (
    <div className={`flex justify-between items-start pb-4 mb-4 border-b-2 border-border border-l-4 ${accentStyles[accentColor].border} ${accentStyles[accentColor].shadow} ${className}`}>
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-tighter">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1 font-mono">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
  );
}
