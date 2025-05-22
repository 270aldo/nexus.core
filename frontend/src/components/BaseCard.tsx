import React, { ReactNode } from "react";
import { cn } from "utils/cn";
import * as ds from "utils/design-system";

export interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "prime" | "longevity" | "success" | "warning" | "danger";
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  withShadow?: boolean;
  onClick?: () => void;
}

/**
 * Componente de tarjeta base que sigue las especificaciones del sistema de diseño
 * Utilizar este componente para crear nuevas tarjetas consistentes
 */
export function BaseCard({ 
  children, 
  className = "",
  variant = "default",
  header,
  footer,
  bordered = true,
  withShadow = false,
  onClick
}: Props) {
  const colorVariant = variant === "default" ? "neutral" : variant;
  const variantClasses = ds.getVariantClasses(colorVariant);
  
  return (
    <div className={cn(
      ds.components.card,
      bordered && ds.borders.card,
      "flex flex-col h-full",
      colorVariant !== "neutral" && `${bordered ? ds.borders.cardAccent : ""} ${variantClasses.border}`,
      withShadow && variantClasses.glow,
      onClick && "cursor-pointer transition-all duration-200 hover:shadow-md",
      className
    )}
    onClick={onClick}
    >
      {header && (
        <div className={cn(ds.spacing.cardHeader, ds.borders.divider)}>
          {header}
        </div>
      )}
      
      <div className={cn(ds.spacing.cardContent, "flex-1")}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(ds.spacing.cardFooter, bordered && "border-t border-border")}>
          {footer}
        </div>
      )}
    </div>
  );
}