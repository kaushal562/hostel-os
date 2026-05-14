/**
 * Premium Forms & Modals
 * Luxury form elements and modal dialogs
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOTION, TRANSITIONS } from "@/lib/premium-motion";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * Premium Form Container
 */
export function PremiumForm({
  children,
  onSubmit,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <motion.form
      initial="hidden"
      animate="show"
      variants={MOTION.container}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {(title || subtitle) && (
        <motion.div variants={MOTION.slideInUp} className="mb-8">
          {title && (
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-400">{subtitle}</p>
          )}
        </motion.div>
      )}
      {children}
    </motion.form>
  );
}

/**
 * Premium Form Field
 */
export function PremiumFormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={MOTION.slideInUp}
      className="space-y-2"
    >
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 font-medium"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </motion.div>
  );
}

/**
 * Premium Modal
 */
export function PremiumModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showCloseButton = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITIONS.smooth}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={TRANSITIONS.smooth}
              className={clsx(
                "w-full glass rounded-2xl border border-white/10 p-6 md:p-8",
                sizes[size]
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  {title && (
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-slate-400">{subtitle}</p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </motion.button>
                )}
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...TRANSITIONS.smooth, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Premium Confirmation Dialog
 */
export function PremiumConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDangerous = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
}) {
  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITIONS.smooth}
        className="space-y-6"
      >
        <p className="text-slate-300">{message}</p>

        <div className="flex gap-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors"
          >
            {cancelLabel}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              isDangerous
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:shadow-glow-cyan text-white"
            )}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </PremiumModal>
  );
}

/**
 * Premium Toast Notification
 */
export function PremiumToast({
  isOpen,
  onClose,
  message,
  type = "info",
  action,
  duration = 5000,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  action?: { label: string; onClick: () => void };
  duration?: number;
}) {
  React.useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const colors = {
    info: "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/50 text-cyan-200",
    success: "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/50 text-emerald-200",
    warning: "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/50 text-amber-200",
    error: "bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50 text-red-200",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={TRANSITIONS.smooth}
          className={clsx(
            "fixed bottom-6 right-6 z-50 glass rounded-lg border p-4 max-w-sm",
            colors[type]
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{message}</p>
            <div className="flex items-center gap-2">
              {action && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className="text-xs font-semibold hover:underline"
                >
                  {action.label}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Premium Drawer (Side Panel)
 */
export function PremiumDrawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  const directionClass = side === "left" ? "-translate-x-full" : "translate-x-full";
  const directionAnimate = side === "left" ? { x: 0 } : { x: 0 };
  const directionExit = side === "left" ? { x: -400 } : { x: 400 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITIONS.smooth}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={side === "left" ? { x: -400 } : { x: 400 }}
            animate={directionAnimate}
            exit={directionExit}
            transition={TRANSITIONS.smooth}
            className={clsx(
              "fixed top-0 h-screen w-96 glass border border-white/10 flex flex-col z-50",
              side === "left" ? "left-0 border-r" : "right-0 border-l"
            )}
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              {title && (
                <h2 className="text-lg font-bold text-slate-100">{title}</h2>
              )}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Premium Loading Spinner
 */
export function PremiumLoadingSpinner({
  size = "md",
  message,
}: {
  size?: "sm" | "md" | "lg";
  message?: string;
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={clsx(
          sizes[size],
          "rounded-full border-2 border-slate-700 border-t-cyan-500 shadow-glow-cyan"
        )}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 font-medium"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
