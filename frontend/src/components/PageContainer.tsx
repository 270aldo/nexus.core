import React from "react";

export interface Props {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * A container for page content with consistent padding and max-width
 * following neo-brutalist design principles
 */
export function PageContainer({ children, className = "", fullWidth = false }: Props) {
  return (
    <div className={`pt-6 pb-4 px-4 space-y-6 ${fullWidth ? "" : "container max-w-7xl mx-auto"} ${className}`}>
      {children}
    </div>
  );
}
