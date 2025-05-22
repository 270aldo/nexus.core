import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as ds from "utils/design-system";
import { cn } from "utils/cn";

export interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  variant?: "prime" | "longevity" | "success" | "warning" | "danger" | "default";
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = "",
  variant = "default",
  onClick
}: Props) {
  const colorVariant = variant === "default" ? "neutral" : variant;
  const variantClasses = ds.getVariantClasses(colorVariant);
  
  const trendColors = {
    up: ds.colors.success.text,
    down: ds.colors.danger.text,
    neutral: colorVariant !== "neutral" ? variantClasses.text : "text-blue-500"
  };

  return (
    <div 
      className={cn(
        ds.components.card,
        colorVariant !== "neutral" && `border-l-4 ${variantClasses.border}`,
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        ds.spacing.cardHeader,
        ds.borders.divider
      )}>
        <div className={cn(
          ds.typography.cardTitle,
          "flex items-center justify-between",
          colorVariant !== "neutral" && variantClasses.text
        )}>
          {title}
          {icon && <span>{icon}</span>}
        </div>
      </div>
      <div className={ds.spacing.cardContent}>
        <div className={cn(ds.typography.value, "text-xl sm:text-2xl")}>{value}</div>
        {subtitle && <p className={cn(ds.typography.caption, "mt-1")}>{subtitle}</p>}
        {trend && trendValue && (
          <div className={cn(
            ds.typography.mono, 
            ds.typography.xs, 
            "mt-2",
            trendColors[trend]
          )}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}