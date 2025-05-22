import React, { useState } from "react";
import { Layout } from "components/Layout";
import { ThemeStyles } from "components/ThemeStyles";
import { cn } from "utils/cn";

export interface Props {
  children: React.ReactNode;
  title?: string;
  navbarActions?: React.ReactNode;
  showNavbar?: boolean;
  variant?: "prime" | "longevity" | "neutral";
}

/**
 * Application shell component that applies the neo-brutalist theme
 * and provides consistent layout structure across the application
 */
export function AppShell({ 
  children, 
  title, 
  navbarActions, 
  showNavbar = true,
  variant = "neutral" 
}: Props) {
  return (
    <>
      <ThemeStyles />
      <Layout 
        title={title} 
        navbarActions={navbarActions} 
        showNavbar={showNavbar}
        variant={variant}
      >
        {children}
      </Layout>
    </>
  );
}