/**
 * Premium Navigation & Sidebar Components
 * Luxury floating navigation with intelligent animations
 */

import React from "react";
import { motion } from "framer-motion";
import { MOTION, TRANSITIONS } from "@/lib/premium-motion";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: string | number;
}

/**
 * Premium Sidebar Navigation
 */
export function PremiumSidebar({
  items,
  collapsed = false,
  onCollapse,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onCollapse?: () => void;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={TRANSITIONS.smooth}
      className="fixed left-0 top-0 h-screen glass border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-lg text-gradient"
          >
            Portal
          </motion.div>
        )}
        <motion.button
          onClick={onCollapse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {collapsed ? "→" : "←"}
        </motion.button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <PremiumNavItem
            key={item.label}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-400"
        >
          {collapsed ? "?" : "Help & Support"}
        </motion.button>
      </div>
    </motion.aside>
  );
}

/**
 * Premium Navigation Item
 */
function PremiumNavItem({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      onClick={item.onClick}
      whileHover={!item.isActive ? { x: 4 } : undefined}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "relative w-full group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200",
        item.isActive
          ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/50"
          : "hover:bg-white/5 border border-transparent"
      )}
    >
      {/* Active glow */}
      {item.isActive && (
        <motion.div
          layoutId="nav-glow"
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      )}

      {/* Icon */}
      <div className="relative flex items-center gap-3 flex-1 min-w-0">
        <motion.div
          animate={item.isActive ? { scale: [1, 1.05, 1] } : undefined}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={clsx(
            "flex-shrink-0 w-5 h-5",
            item.isActive && "text-cyan-400"
          )}
        >
          <Icon className="w-full h-full" />
        </motion.div>

        {/* Label */}
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              "text-sm font-medium truncate",
              item.isActive ? "text-slate-100" : "text-slate-400"
            )}
          >
            {item.label}
          </motion.span>
        )}
      </div>

      {/* Badge */}
      {item.badge !== undefined && !collapsed && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-2 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex-shrink-0"
        >
          {item.badge}
        </motion.span>
      )}

      {/* Active indicator line */}
      {item.isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-r"
        />
      )}
    </motion.button>
  );
}

/**
 * Premium Top Navigation Bar
 */
export function PremiumTopNav({
  title,
  actions,
  onMenuClick,
}: {
  title?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.slower}
      className="sticky top-0 z-40 glass border-b border-white/5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            ☰
          </motion.button>
          {title && (
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {actions}
        </div>
      </div>

      {/* Accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </motion.nav>
  );
}

/**
 * Premium Breadcrumb Navigation
 */
export function PremiumBreadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string; onClick?: () => void }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={TRANSITIONS.smooth}
      className="flex items-center gap-2 text-sm text-slate-400"
    >
      {items.map((item, index) => (
        <motion.div key={index} className="flex items-center gap-2">
          <button
            onClick={item.onClick}
            className={clsx(
              "hover:text-slate-200 transition-colors",
              index === items.length - 1 && "text-slate-100 font-medium"
            )}
          >
            {item.label}
          </button>
          {index < items.length - 1 && (
            <span className="text-slate-600">/</span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Premium Tab Navigation
 */
export function PremiumTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ id: string; label: string; icon?: LucideIcon }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={TRANSITIONS.smooth}
      className="flex items-center gap-1 glass rounded-lg p-1 border border-white/10 w-fit"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "relative px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm",
              isActive
                ? "text-white"
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-md -z-10"
              />
            )}

            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/**
 * Premium Floating Action Button
 */
export function PremiumFAB({
  icon: Icon,
  onClick,
  label,
}: {
  icon: LucideIcon;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, rotateZ: 90 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={TRANSITIONS.smooth}
      className="fixed bottom-8 right-8 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-floating-lg hover:shadow-glow-cyan group"
      title={label}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Icon className="w-6 h-6 relative z-10" />
    </motion.button>
  );
}

/**
 * Premium Dropdown Menu
 */
export function PremiumDropdown({
  trigger,
  items,
  onSelect,
}: {
  trigger: React.ReactNode;
  items: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    divider?: boolean;
  }>;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {trigger}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={
          open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }
        }
        transition={TRANSITIONS.snappy}
        className={clsx(
          "absolute right-0 mt-2 w-48 glass rounded-lg border border-white/10 overflow-hidden",
          !open && "pointer-events-none"
        )}
      >
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.divider ? (
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            ) : (
              <motion.button
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                className="w-full px-4 py-3 text-sm text-slate-300 font-medium flex items-center gap-3 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </motion.button>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
