// Centralized design tokens and styles for consistent app styling

// Colors
export const colors = {
  prime: {
    text: "text-indigo-500",
    border: "border-indigo-500",
    bg: "bg-indigo-500",
    bgHover: "hover:bg-indigo-600",
    bgLight: "bg-indigo-500/10",
    borderLight: "border-indigo-500/20",
    shadow: "shadow-indigo-500/20",
    textHover: "hover:text-indigo-500",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    textGlow: "text-indigo-500 text-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
  },
  longevity: {
    text: "text-pink-500",
    border: "border-pink-500",
    bg: "bg-pink-500",
    bgHover: "hover:bg-pink-600",
    bgLight: "bg-pink-500/10",
    borderLight: "border-pink-500/20",
    shadow: "shadow-pink-500/20",
    textHover: "hover:text-pink-500",
    glow: "shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    textGlow: "text-pink-500 text-shadow-[0_0_8px_rgba(236,72,153,0.5)]"
  },
  success: {
    text: "text-emerald-500",
    border: "border-emerald-500",
    bg: "bg-emerald-500",
    bgHover: "hover:bg-emerald-600",
    bgLight: "bg-emerald-500/10",
    borderLight: "border-emerald-500/20",
    shadow: "shadow-emerald-500/20",
    textHover: "hover:text-emerald-500",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]"
  },
  warning: {
    text: "text-amber-500",
    border: "border-amber-500",
    bg: "bg-amber-500",
    bgHover: "hover:bg-amber-600",
    bgLight: "bg-amber-500/10",
    borderLight: "border-amber-500/20",
    shadow: "shadow-amber-500/20",
    textHover: "hover:text-amber-500",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]"
  },
  danger: {
    text: "text-red-500",
    border: "border-red-500",
    bg: "bg-red-500",
    bgHover: "hover:bg-red-600",
    bgLight: "bg-red-500/10",
    borderLight: "border-red-500/20",
    shadow: "shadow-red-500/20",
    textHover: "hover:text-red-500",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  },
  neutral: {
    text: "text-foreground",
    border: "border-border",
    bg: "bg-primary",
    bgHover: "hover:bg-primary/80",
    bgLight: "bg-primary/10",
    borderLight: "border-primary/20",
    shadow: "shadow-primary/20",
    textHover: "hover:text-foreground",
    glow: "shadow-md"
  }
};

// Typography
export const typography = {
  pageTitle: "text-2xl md:text-3xl font-bold tracking-tight",
  sectionTitle: "text-xl font-semibold tracking-tight",
  cardTitle: "text-lg font-semibold tracking-tight",
  label: "text-sm font-medium text-muted-foreground",
  value: "text-base font-medium",
  code: "font-mono text-sm bg-muted p-0.5 rounded",
  dataPoint: "font-mono text-base",
  caption: "text-xs text-muted-foreground",
  prominentValue: "text-3xl font-bold font-mono",
  mono: "font-mono",
  xs: "text-xs",
  sm: "text-sm"
};

// Borders and Shadows
export const borders = {
  card: "border shadow-sm hover:shadow-md transition-shadow duration-200",
  panel: "border rounded-md shadow-sm",
  input: "border rounded-md",  
  divider: "border-t border-border/50 my-4",
  thin: "border",
  standard: "border-2",
  thick: "border-4",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  cardAccent: "border-2 border-border border-l-4 rounded-sm"
};

// Spacing
export const spacing = {
  section: "py-6 md:py-10",
  container: "container max-w-7xl mx-auto px-4",
  stacked: "space-y-6",
  stackedLg: "space-y-8",
  gridGap: "gap-4 md:gap-6",
  cardHeader: "p-4 pb-2",
  cardContent: "p-4 pt-3",
  cardFooter: "p-4 pt-0"
};

// Animations
export const animations = {
  fadeIn: "animate-fadeIn",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce"
};

// Status Colors
export const status = {
  success: "text-green-500 bg-green-500/10 border-green-500/20",
  warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  error: "text-red-500 bg-red-500/10 border-red-500/20",
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  neutral: "text-gray-500 bg-gray-500/10 border-gray-500/20"
};

// Layout
export const layout = {
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  grid4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  flex: "flex flex-col md:flex-row gap-4",
  flexBetween: "flex justify-between items-center",
  flexCenter: "flex justify-center items-center",
  flexEnd: "flex justify-end items-center"
};

// Components
export const components = {
  card: `border bg-card overflow-hidden`,
  panel: `border bg-card overflow-hidden`,
  actionButton: `border rounded-sm bg-background hover:bg-accent shadow-none`
};

// Button styles
export const buttons = {
  prime: "border-indigo-500 text-indigo-500 hover:bg-indigo-50",
  longevity: "border-pink-500 text-pink-500 hover:bg-pink-50"
};

// Responsive layouts
export const responsive = {
  grid: {
    twoCol: "grid grid-cols-1 md:grid-cols-2 gap-6",
    threeCol: "grid grid-cols-1 md:grid-cols-3 gap-6",
    fourCol: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
  },
  pagePadding: "px-4 py-6 md:p-8",
  elementsGap: "space-y-4",
  sectionGap: "space-y-12"
};

/**
 * Función auxiliar para obtener todas las clases para una variante de color específica
 */
export const getVariantClasses = (variant: keyof typeof colors) => {
  return {
    border: colors[variant].border,
    bg: colors[variant].bg,
    bgHover: colors[variant].bgHover,
    text: colors[variant].text,
    textHover: colors[variant].textHover,
    glow: colors[variant].glow
  };
};
