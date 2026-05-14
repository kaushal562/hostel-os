/**
 * Premium Design System
 * Enterprise-grade SaaS luxury aesthetic tokens
 */

export const PREMIUM_COLORS = {
  // Dark luxury backdrop
  background: {
    primary: "#0a0e27", // Deep space navy
    secondary: "#111933", // Slightly lighter navy
    tertiary: "#1a1f3a", // Card background
    overlay: "rgba(10, 14, 39, 0.8)",
  },
  
  // Foreground hierarchy
  text: {
    primary: "#f0f4ff", // Premium white
    secondary: "#a8b5d1", // Muted lavender
    tertiary: "#757c92", // Further muted
  },

  // Accent gradients - premium SaaS style
  accent: {
    cyan: "#00d9ff",
    purple: "#7c3aed",
    pink: "#ec4899",
    blue: "#3b82f6",
    emerald: "#10b981",
  },

  // Glass & Blur
  glass: {
    light: "rgba(240, 244, 255, 0.05)",
    medium: "rgba(240, 244, 255, 0.08)",
    heavy: "rgba(240, 244, 255, 0.12)",
  },

  // Status colors
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
};

export const PREMIUM_SHADOWS = {
  // Layered shadows for depth
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  
  // Glow effects
  glow: {
    cyan: "0 0 30px rgba(0, 217, 255, 0.3)",
    purple: "0 0 30px rgba(124, 58, 237, 0.3)",
    pink: "0 0 30px rgba(236, 72, 153, 0.3)",
    blue: "0 0 20px rgba(59, 130, 246, 0.2)",
  },

  // Floating effect
  floating: {
    sm: "0 4px 20px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.15)",
    lg: "0 20px 40px rgba(0, 0, 0, 0.4), 0 25px 50px rgba(0, 0, 0, 0.2)",
  },

  // Inset for glass effect
  inset: "inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 0 rgba(0, 0, 0, 0.3)",
};

export const PREMIUM_TRANSITIONS = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  slowest: "500ms cubic-bezier(0.4, 0, 0.2, 1)",

  // Easing functions for premium feel
  easing: {
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    smooth_in: "cubic-bezier(0.4, 0, 1, 1)",
    smooth_out: "cubic-bezier(0, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

export const PREMIUM_BLUR = {
  sm: "blur(4px)",
  md: "blur(8px)",
  lg: "blur(16px)",
  xl: "blur(24px)",
};

export const PREMIUM_GRADIENTS = {
  // Hero gradients
  hero: {
    mesh: "linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(124,58,237,0.1) 50%, rgba(236,72,153,0.1) 100%)",
    subtle: "linear-gradient(180deg, rgba(10,14,39,0) 0%, rgba(10,14,39,0.8) 100%)",
  },

  // Card gradients
  card: {
    subtle: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    glow: "linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(124,58,237,0.05) 100%)",
  },

  // Status gradients
  status: {
    success: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
    warning: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
    error: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
  },
};

export const PREMIUM_SPACING = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
};

export const PREMIUM_RADIUS = {
  none: "0",
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "1rem", // 16px
  xl: "1.5rem", // 24px
  full: "9999px",
};
