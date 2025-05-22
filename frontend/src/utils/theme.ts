// Theme configuration for the application
// Provides a consistent color palette for all components

// Primary color palette (blue spectrum)
export const primaryColors = {
  light: "#3b82f6",
  medium: "#2563eb",
  dark: "#1d4ed8",
  subtle: "rgba(59, 130, 246, 0.15)"
};

// Secondary color palette (purple spectrum)
export const secondaryColors = {
  light: "#8b5cf6",
  medium: "#7c3aed",
  dark: "#6d28d9",
  subtle: "rgba(139, 92, 246, 0.15)"
};

// Accent color palette (teal spectrum)
export const accentColors = {
  light: "#14b8a6",
  medium: "#0d9488",
  dark: "#0f766e",
  subtle: "rgba(20, 184, 166, 0.15)"
};

// Status colors (success, warning, error)
export const statusColors = {
  success: {
    light: "#10b981",
    dark: "#059669",
    subtle: "rgba(16, 185, 129, 0.15)"
  },
  warning: {
    light: "#eab308",
    dark: "#ca8a04",
    subtle: "rgba(234, 179, 8, 0.15)"
  },
  error: {
    light: "#f43f5e",
    dark: "#e11d48",
    subtle: "rgba(244, 63, 94, 0.15)"
  }
};

// Neutral colors for UI elements
export const neutralColors = {
  background: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  subtle: "#475569",
  text: {
    primary: "#f8fafc",
    secondary: "#cbd5e1",
    muted: "#94a3b8"
  }
};

// Common chart color sequences
export const chartColors = {
  sequence1: ["#3b82f6", "#8b5cf6", "#14b8a6", "#10b981", "#eab308"],
  sequence2: ["#2563eb", "#7c3aed", "#0d9488", "#059669", "#ca8a04"],
  measurement: {
    weight: "#3b82f6",
    bodyFat: "#8b5cf6",
    waist: "#10b981",
    chest: "#0ea5e9",
    hips: "#6366f1",
    arms: "#0d9488",
    legs: "#059669"
  },
  workout: {
    intensity: "#f43f5e",
    duration: "#8b5cf6",
    volume: "#14b8a6"
  },
  feedback: {
    energy: "#eab308",
    mood: "#14b8a6",
    sleep: "#8b5cf6",
    motivation: "#10b981",
    stress: "#f43f5e"
  }
};

// Export a default theme object
export const theme = {
  primary: primaryColors,
  secondary: secondaryColors,
  accent: accentColors,
  status: statusColors,
  neutral: neutralColors,
  chart: chartColors
};

export default theme;