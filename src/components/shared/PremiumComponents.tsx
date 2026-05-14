/**
 * Premium UI Components
 * Reusable premium components with motion
 */

import React from "react";
import { motion, MotionProps, HTMLMotionProps, Variants } from "framer-motion";
import { MOTION, TRANSITIONS, STAGGER } from "@/lib/premium-motion";
import clsx from "clsx";

/**
 * Premium Container with staggered children
 */
export function PremiumContainer({
  children,
  className,
  stagger = "medium",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: "small" | "medium" | "large";
} & MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={MOTION.container}
      custom={STAGGER[stagger]}
      className={clsx("space-y-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Premium Item for stagger animations
 */
export function PremiumItem({
  children,
  className,
  variant = "slideInUp",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "slideInUp" | "scaleIn" | "fadeIn";
}) {
  const variants: Record<"slideInUp" | "scaleIn" | "fadeIn", Variants> = {
    slideInUp: MOTION.slideInUp,
    scaleIn: MOTION.scaleIn,
    fadeIn: MOTION.fadeIn,
  };

  return (
    <motion.div
      variants={variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Premium Card with glass and hover effects
 */
export function PremiumCard({
  children,
  className,
  hoverable = true,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: "cyan" | "purple" | "pink" | false;
}) {
  const glowClassMap: Record<"cyan" | "purple" | "pink", string> = {
    cyan: "hover:shadow-glow-cyan",
    purple: "hover:shadow-glow-purple",
    pink: "hover:shadow-glow-pink",
  };
  const glowClass = glow ? glowClassMap[glow] : "";

  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={TRANSITIONS.smooth}
      className={clsx(
        "glass rounded-xl p-6 border border-white/10",
        "hover:border-white/20 transition-all duration-300",
        hoverable && "shadow-floating-sm",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Premium Button with premium styling
 */
export function PremiumButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
} & HTMLMotionProps<"button">) {
  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-glow-cyan",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    outline: "border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={TRANSITIONS.snappy}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium",
        "transition-all duration-200 focus-premium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Premium Input Field
 */
export const PremiumInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "input-premium",
        className
      )}
      {...props}
    />
  );
});

PremiumInput.displayName = "PremiumInput";

/**
 * Premium Section with animated background
 */
export function PremiumSection({
  children,
  className,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className={clsx("relative py-12 md:py-20", className)}>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TRANSITIONS.slower}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-400">{subtitle}</p>
          )}
        </motion.div>
      )}
      {children}
    </section>
  );
}

/**
 * Animated Counter for KPIs
 */
export function AnimatedCounter({
  value,
  suffix = "",
  duration = 2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-gradient font-bold text-2xl"
    >
      {displayValue}{suffix}
    </motion.span>
  );
}

/**
 * Floating Badge/Label
 */
export function FloatingBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={clsx(
        "inline-block px-4 py-2 rounded-full",
        "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
        "border border-cyan-400/50 text-cyan-300",
        "text-sm font-medium",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Glowing Line Separator
 */
export function GlowingSeparator({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
      className={clsx(
        "h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent",
        "shadow-glow-cyan",
        className
      )}
    />
  );
}

/**
 * Premium Status Indicator
 */
export function StatusIndicator({
  status,
  label,
}: {
  status: "active" | "inactive" | "pending";
  label?: string;
}) {
  const colors = {
    active: "bg-emerald-500 shadow-glow-emerald",
    inactive: "bg-slate-500",
    pending: "bg-amber-500 shadow-glow-pink",
  };

  const labels = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={clsx("w-2 h-2 rounded-full", colors[status])}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-sm text-slate-300">
        {label || labels[status]}
      </span>
    </div>
  );
}
