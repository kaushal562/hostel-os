/**
 * Premium Dashboard Layout & Components
 * Cinematic admin interface with command center aesthetic
 */

import React from "react";
import { motion } from "framer-motion";
import { MOTION, TRANSITIONS, STAGGER } from "@/lib/premium-motion";
import clsx from "clsx";

/**
 * Premium Dashboard Container
 */
export function PremiumDashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern pointer-events-none" />

      {/* Floating gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TRANSITIONS.slower}
            className="px-6 py-8 md:px-8 md:py-12 border-b border-white/5 backdrop-blur-sm"
          >
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient">{title}</span>
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-400 text-lg">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Content */}
        <div className="px-6 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}

/**
 * Premium KPI Card - for metrics & statistics
 */
export function PremiumKPICard({
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = "up",
  accentColor = "cyan",
}: {
  icon?: React.ComponentType<any>;
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: "cyan" | "purple" | "pink" | "emerald";
}) {
  const accentGradients = {
    cyan: "from-cyan-600 to-blue-600",
    purple: "from-purple-600 to-blue-600",
    pink: "from-pink-600 to-purple-600",
    emerald: "from-emerald-600 to-cyan-600",
  };

  const accentGlows = {
    cyan: "shadow-glow-cyan",
    purple: "shadow-glow-purple",
    pink: "shadow-glow-pink",
    emerald: "shadow-glow-cyan",
  };

  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={TRANSITIONS.smooth}
      className="group relative glass rounded-xl p-6 border border-white/10 overflow-hidden"
    >
      {/* Background glow */}
      <div className={clsx(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
        "bg-gradient-to-br",
        accentGradients[accentColor]
      )} style={{ opacity: 0.05 }} />

      <div className="relative z-10">
        {/* Icon */}
        {Icon && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={clsx(
              "w-12 h-12 rounded-lg mb-4",
              "bg-gradient-to-br",
              accentGradients[accentColor],
              "flex items-center justify-center",
              accentGlows[accentColor]
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        )}

        {/* Label */}
        <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-3"
        >
          <p className="text-3xl font-bold text-slate-100">{value}</p>
        </motion.div>

        {/* Trend */}
        {trend && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={clsx("text-sm font-medium", trendColors[trendDirection])}
          >
            {trendDirection === "up" && "↑"} {trend}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Premium Data Grid / Table wrapper
 */
export function PremiumDataGrid({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.slower}
      viewport={{ once: true }}
      className="glass rounded-xl border border-white/10 overflow-hidden"
    >
      {title && (
        <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Premium Activity Feed
 */
export function PremiumActivityFeed({
  activities,
}: {
  activities: Array<{
    id: string;
    timestamp: string;
    action: string;
    user: string;
    status?: "success" | "warning" | "error";
  }>;
}) {
  const statusColors = {
    success: "text-emerald-400 bg-emerald-400/10",
    warning: "text-amber-400 bg-amber-400/10",
    error: "text-red-400 bg-red-400/10",
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      viewport={{ once: true }}
      className="glass rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-slate-100">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/5">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0 },
            }}
            transition={TRANSITIONS.smooth}
            className="px-6 py-4 hover:bg-white/5 transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-slate-100 font-medium mb-1">{activity.action}</p>
                <p className="text-slate-500 text-sm">{activity.user}</p>
              </div>
              <div className="text-right">
                {activity.status && (
                  <span className={clsx(
                    "inline-block px-2 py-1 rounded text-xs font-medium mb-2",
                    statusColors[activity.status]
                  )}>
                    {activity.status}
                  </span>
                )}
                <p className="text-slate-500 text-xs whitespace-nowrap">{activity.timestamp}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Premium Stats Section
 */
export function PremiumStatsSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      viewport={{ once: true, margin: "-100px" }}
      className={clsx("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Premium Alert Banner
 */
export function PremiumAlert({
  type = "info",
  title,
  message,
  action,
}: {
  type?: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  const styles = {
    info: "glass border-cyan-500/50 bg-cyan-500/10",
    warning: "glass border-amber-500/50 bg-amber-500/10",
    error: "glass border-red-500/50 bg-red-500/10",
    success: "glass border-emerald-500/50 bg-emerald-500/10",
  };

  const textColors = {
    info: "text-cyan-200",
    warning: "text-amber-200",
    error: "text-red-200",
    success: "text-emerald-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.smooth}
      className={clsx("rounded-lg p-4", styles[type])}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className={clsx("font-semibold mb-1", textColors[type])}>
            {title}
          </h4>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Premium Chart Container
 */
export function PremiumChartContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.slower}
      viewport={{ once: true }}
      className="glass rounded-xl border border-white/10 p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-slate-500 text-sm">{subtitle}</p>
        )}
      </div>
      <div className="h-96">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Loading State - Premium skeleton
 */
export function PremiumSkeletonCard() {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="space-y-4">
        <div className="h-12 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg animate-shimmer" />
        <div className="h-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded animate-shimmer" />
        <div className="h-4 w-3/4 bg-gradient-to-r from-slate-800 to-slate-700 rounded animate-shimmer" />
      </div>
    </div>
  );
}
