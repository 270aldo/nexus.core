import React from "react";
import { Button } from "@/components/ui/button";
import * as ds from "utils/design-system";
import { cn } from "utils/cn";
import { BaseCard } from "components/BaseCard";
import { CardTitle } from "components/CardTitle";

export interface Props {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
  variant?: "prime" | "longevity" | "default";
  onClick?: () => void;
}

export function ProgramCard({
  title,
  subtitle,
  stats,
  ctaText = "View Details",
  onCtaClick,
  className = "",
  variant = "default",
  onClick
}: Props) {
  return (
    <BaseCard
      variant={variant}
      className={className}
      withShadow={variant !== "default"}
      onClick={onClick}
      header={
        <>
          <CardTitle variant={variant}>{title}</CardTitle>
          <p className={ds.typography.caption}>{subtitle}</p>
        </>
      }
      footer={
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onCtaClick && onCtaClick();
          }} 
          variant="outline" 
          className={cn("w-full", ds.typography.mono, ds.typography.sm)}
        >
          {ctaText}
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <p className={cn(ds.typography.caption, "font-semibold")}>{stat.label}</p>
            <p className={cn(ds.typography.value, "text-xl sm:text-2xl")}>{stat.value}</p>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}