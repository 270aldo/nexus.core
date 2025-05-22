import React from "react";

export interface Props {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  accent?: "prime" | "longevity" | "neutral" | "success" | "danger";
  actions?: React.ReactNode;
  onClick?: () => void;
}

/**
 * A neo-brutalist card component with optional accent color
 * for consistent styling across the application
 */
export function ContentCard({ 
  children, 
  className = "", 
  title, 
  subtitle,
  accent = "neutral",
  actions,
  onClick
}: Props) {
  // Define accent colors based on design system
  const accentColors = {
    prime: "border-indigo-500",
    longevity: "border-pink-500",
    neutral: "border-slate-600",
    success: "border-emerald-500",
    danger: "border-red-500"
  };
  
  // Define accent glow effects
  const glowEffects = {
    prime: "shadow-[0_0_15px_rgba(99,102,241,0.5)]",
    longevity: "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
    neutral: "",
    success: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    danger: "shadow-[0_0_15px_rgba(239,68,68,0.5)]"
  };

  return (
    <div 
      className={`relative bg-slate-800/50 border-2 border-slate-700 ${glowEffects[accent]} ${className}`}
      onClick={onClick}
    >
      {/* Card header with accent border */}
      {(title || actions) && (
        <div className={`flex justify-between items-center p-4 border-b-2 border-slate-700 ${title ? `border-l-4 ${accentColors[accent]}` : ""}`}>
          {title && (
            <div>
              <h3 className="font-mono font-bold tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground font-mono mt-1">{subtitle}</p>}
            </div>
          )}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      {/* Card content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
