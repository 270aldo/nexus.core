import React from "react";
import { ThemeStyles } from "./ThemeStyles";
import { Toaster } from "sonner";
import { ThemeProvider } from "../internal-components/ThemeProvider";
import { DEFAULT_THEME } from "../constants/default-theme";
import { AuthProvider } from "../utils/auth-context";

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * AppProvider component that wraps the entire application
 * Provides global styles, context providers, and third-party components
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider defaultTheme={DEFAULT_THEME} storageKey="ngx-theme">
      <AuthProvider>
        {/* Global Styles */}
        <ThemeStyles />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(30, 41, 59, 0.95)",
              color: "#e2e8f0",
              border: "2px solid rgba(71, 85, 105, 0.8)",
              borderLeft: "4px solid rgba(99, 102, 241, 1)",
              fontFamily: "ui-monospace, monospace",
            },
          }}
        />
        
        {/* App Content */}
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}