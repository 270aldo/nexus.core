import React from "react";

/**
 * Global theme styles for the neo-brutalist design system
 * Applied at the application root level
 */
export function ThemeStyles() {
  return (
    <style jsx global>{`
      /* Base neo-brutalist styles */
      :root {
        --prime-glow: 0 0 20px rgba(99, 102, 241, 0.4);
        --longevity-glow: 0 0 20px rgba(236, 72, 153, 0.4);
        --success-glow: 0 0 20px rgba(16, 185, 129, 0.4);
        --warning-glow: 0 0 20px rgba(245, 158, 11, 0.4);
        --danger-glow: 0 0 20px rgba(239, 68, 68, 0.4);
      }
      
      /* Global default styles */
      html, body {
        min-height: 100vh;
      }
      
      /* Optimizaciones para dispositivos móviles */
      @media (max-width: 640px) {
        html {
          font-size: 14px;
        }
        
        button, a, [role="button"] {
          min-height: 40px;
          min-width: 40px;
        }
      }
      
      /* Mejorar experiencia táctil */
      button, a, [role="button"], input, select, textarea {
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Evitar zoom no deseado en inputs en iOS */
      @media screen and (-webkit-min-device-pixel-ratio: 0) { 
        select,
        textarea,
        input {
          font-size: 16px;
        }
      }
      
      /* Light theme styles */
      :root, .light {
        background-color: #ffffff;
        color: #0f172a;
      }
      
      /* Card and panel styles for light theme */
      .light .bg-slate-800,
      .light .bg-slate-900,
      .light .bg-slate-800\/50 {
        background-color: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      
      .light .bg-slate-700 {
        background-color: #f1f5f9 !important;
      }
      
      .light .bg-slate-700\/50 {
        background-color: rgba(241, 245, 249, 0.5) !important;
      }
      
      /* Border colors for light theme */
      .light .border-slate-700,
      .light .border-slate-800,
      .light .border-slate-900 {
        border-color: #e2e8f0 !important;
      }
      
      /* Text colors for light theme */
      .light .text-slate-400 {
        color: #64748b !important;
      }
      
      .light .text-slate-300 {
        color: #475569 !important;
      }
      
      .light .text-slate-50 {
        color: #0f172a !important;
      }

      /* Theme styles - dark theme with black background */
      .dark {
        background-color: #000000 !important;
        color: #f8fafc;
      }
      
      /* Background color overrides for dark theme */
      .dark body,
      .dark main,
      .dark .bg-slate-900,
      .dark .bg-slate-800,
      .dark .bg-slate-800\/80 {
        background-color: #000000 !important;
      }
      
      .dark .bg-slate-700 {
        background-color: #0f0f0f !important;
      }
      
      .dark .bg-slate-700\/50 {
        background-color: rgba(15, 15, 15, 0.5) !important;
      }
      
      /* Card styles in dark theme */
      .dark .card,
      .dark .border-2,
      .dark .border,
      .dark [class*="border-"] {
        border-color: #1e1e1e !important;
      }
      
      /* Form control overrides */
      .dark input,
      .dark select,
      .dark textarea,
      .dark .select-wrapper,
      .dark button {
        background-color: #0f0f0f !important;
        border-color: #1e1e1e !important;
      }
      
      /* Dropdown menu overrides */
      .dark .dropdown-content,
      .dark [role="dialog"],
      .dark [role="menu"] {
        background-color: #0f0f0f !important;
        border-color: #1e1e1e !important;
      }

      /* Glow effects for data cards and panels */
      .glow-prime {
        box-shadow: var(--prime-glow);
      }
      
      .glow-longevity {
        box-shadow: var(--longevity-glow);
      }
      
      .glow-success {
        box-shadow: var(--success-glow);
      }
      
      .glow-warning {
        box-shadow: var(--warning-glow);
      }
      
      .glow-danger {
        box-shadow: var(--danger-glow);
      }
      
      /* Text glow effects */
      .text-glow-prime {
        color: rgba(99, 102, 241, 1);
        text-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
      }
      
      .text-glow-longevity {
        color: rgba(236, 72, 153, 1);
        text-shadow: 0 0 8px rgba(236, 72, 153, 0.5);
      }
      
      /* Neo-brutalist form styles */
      .neo-input {
        background-color: rgba(30, 41, 59, 0.5);
        border: 2px solid rgba(71, 85, 105, 0.8);
        padding: 0.75rem;
        font-family: ui-monospace, monospace;
        transition: all 0.15s ease-in-out;
      }
      
      .neo-input:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.8);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }
      
      /* Card and panel styles */
      .neo-card {
        background-color: rgba(30, 41, 59, 0.5);
        border: 2px solid rgba(71, 85, 105, 0.8);
        border-left: 4px solid rgba(100, 116, 139, 1);
      }
      
      /* Dark theme adjustments for cards */
      .dark .neo-card {
        background-color: rgba(0, 0, 0, 0.5) !important;
        border: 2px solid rgba(30, 30, 30, 0.8) !important;
      }
      
      /* UI Component overrides for dark theme */
      .dark .bg-card,
      .dark .bg-background {
        background-color: #000000 !important;
      }
      
      /* Ensure text remains visible */
      .dark .text-foreground {
        color: #f8fafc !important;
      }
      
      .dark .text-muted-foreground {
        color: #94a3b8 !important;
      }
    `}</style>
  );
}