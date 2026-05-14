/**
 * Premium Motion & Animation Library
 * Framer Motion patterns for cinematic, smooth animations
 */

import { Variants, TargetAndTransition } from "framer-motion";

export const MOTION = {
  // Container animations
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Fade in animations
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  } as Variants,

  // Scale animations - premium entrance
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  } as Variants,

  // Slide animations
  slideInUp: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  } as Variants,

  slideInDown: {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  } as Variants,

  slideInLeft: {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  } as Variants,

  slideInRight: {
    hidden: { opacity: 0, x: 30 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  } as Variants,

  // Floating animation - subtle upward motion
  floating: {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  } as Variants,

  // Glow pulse animation
  glow: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  } as Variants,

  // Hover elevation
  hoverElevate: {
    whileHover: {
      y: -4,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    },
    transition: { duration: 0.2 },
  } as any,

  // Hover tilt
  hoverTilt: {
    whileHover: {
      rotateX: 5,
      rotateY: 5,
    },
  } as any,

  // Button hover
  buttonHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
  } as any,

  // Modal backdrop fade
  backdropFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  } as any,

  // Modal content slide + fade
  modalSlide: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 },
    transition: { duration: 0.3 },
  } as any,

  // Card entrance staggered
  cardStagger: {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        },
      },
    },
  } as any,

  // Shimmer loading animation
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  } as any,

  // Rotate animation
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      },
    },
  } as Variants,

  // Pulse animation
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  } as Variants,
};

// Transition presets
export const TRANSITIONS = {
  /** Section / view switches: calm, sub-200ms */
  workspaceSection: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
  /** Command palette overlay + panel: near-instant */
  commandPalette: { duration: 0.12, ease: [0.33, 0, 0.2, 1] },
  operational: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slower: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  slowest: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  snappy: { duration: 0.2, ease: "easeOut" },
  bounce: { duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] },
} as const;

// Stagger settings
export const STAGGER = {
  small: { staggerChildren: 0.05, delayChildren: 0.1 },
  medium: { staggerChildren: 0.1, delayChildren: 0.15 },
  large: { staggerChildren: 0.15, delayChildren: 0.2 },
} as const;
