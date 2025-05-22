import { useContext } from "react";
import { ThemeProviderContext } from "../internal-components/ThemeProvider";

/**
 * Hook for accessing and managing the theme state
 * Provides functionality to toggle between light, dark, and system themes
 */
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
