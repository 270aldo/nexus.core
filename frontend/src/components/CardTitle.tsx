import React, { ReactNode } from "react";
import { cn } from "utils/cn";
import * as ds from "utils/design-system";

export interface Props {
  children: ReactNode;
  className?: string;
  variant?: "default" | "prime" | "longevity" | "success" | "warning" | "danger";
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * Componente de título para tarjetas estandarizado según el sistema de diseño
 */
export function CardTitle({ 
  children, 
  className = "",
  variant = "default",
  icon,
  size = "md"
}: Props) {
  const colorVariant = variant === "default" ? "neutral" : variant;
  const variantClasses = ds.getVariantClasses(colorVariant);
  
  const sizeClasses = {
    sm: ds.typography.cardTitle,
    md: ds.typography.sectionTitle,
    lg: ds.typography.pageTitle
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between",
      sizeClasses[size],
      colorVariant !== "neutral" && variantClasses.text,
      className
    )}>
      <span>{children}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </div>
  );
}