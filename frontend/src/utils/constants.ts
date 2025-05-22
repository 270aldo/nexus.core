import { theme } from "./theme";

// Application Information
export const APP_NAME = "NexusCore";
export const APP_VERSION = "1.0.0";

// Base URLs and Endpoints
export const API_BASE_URL = "/api";

// Client Types
export const CLIENT_TYPES = [
  { id: "PRIME", name: "NGX PRIME", color: theme.primary.light },
  { id: "LONGEVITY", name: "NGX LONGEVITY", color: theme.secondary.light }
];

// Training Program Status
export const PROGRAM_STATUS = [
  { id: "active", name: "Active", color: theme.status.success.light },
  { id: "completed", name: "Completed", color: theme.accent.light },
  { id: "paused", name: "Paused", color: theme.status.warning.light },
  { id: "planned", name: "Planned", color: theme.neutral.subtle }
];

// Client Status
export const CLIENT_STATUS = [
  { id: "active", name: "Active", color: theme.status.success.light },
  { id: "inactive", name: "Inactive", color: theme.status.error.light },
  { id: "paused", name: "Paused", color: theme.status.warning.light },
  { id: "onboarding", name: "Onboarding", color: theme.primary.light }
];

// Progress Metrics
export const PROGRESS_METRICS = {
  measurements: [
    { id: "weight", name: "Weight", unit: "kg", color: theme.chart.measurement.weight },
    { id: "body_fat_percentage", name: "Body Fat", unit: "%", color: theme.chart.measurement.bodyFat },
    { id: "waist", name: "Waist", unit: "cm", color: theme.chart.measurement.waist },
    { id: "chest", name: "Chest", unit: "cm", color: theme.chart.measurement.chest },
    { id: "hips", name: "Hips", unit: "cm", color: theme.chart.measurement.hips }
  ],
  workout: [
    { id: "intensity", name: "Intensity", unit: "/10", color: theme.chart.workout.intensity },
    { id: "duration", name: "Duration", unit: "min", color: theme.chart.workout.duration },
    { id: "volume", name: "Volume", unit: "sets", color: theme.chart.workout.volume }
  ],
  feedback: [
    { id: "energy_level", name: "Energy", unit: "/10", color: theme.chart.feedback.energy },
    { id: "mood", name: "Mood", unit: "/10", color: theme.chart.feedback.mood },
    { id: "sleep_quality", name: "Sleep", unit: "/10", color: theme.chart.feedback.sleep },
    { id: "motivation", name: "Motivation", unit: "/10", color: theme.chart.feedback.motivation },
    { id: "stress_level", name: "Stress", unit: "/10", color: theme.chart.feedback.stress }
  ]
};

// Dashboard timeframe options
export const TIME_RANGES = [
  { id: "7d", name: "7 Days" },
  { id: "30d", name: "30 Days" },
  { id: "90d", name: "90 Days" },
  { id: "1y", name: "1 Year" }
];

// Navigation sections
export const NAV_SECTIONS = {
  main: "Main",
  programs: "Programs",
  clients: "Clients",
  analytics: "Analytics",
  system: "System"
};

export default {
  APP_NAME,
  APP_VERSION,
  API_BASE_URL,
  CLIENT_TYPES,
  PROGRAM_STATUS,
  CLIENT_STATUS,
  PROGRESS_METRICS,
  TIME_RANGES,
  NAV_SECTIONS
};