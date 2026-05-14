/**
 * Shared operational UI tokens for the admin shell — composition, not decoration.
 */
export const adminVisual = {
  /** Main content rail — paired with AdminWorkspaceShell */
  contentMax: "max-w-[1720px]",

  /** Vertical rhythm between major blocks */
  sectionStack: "flex w-full flex-col gap-5",

  /** PRIMARY — workflows & charts (flat surface, minimal decoration) */
  primaryPanel:
    "rounded-[1.25rem] border border-white/[0.06] bg-slate-950/45",

  /** SECONDARY — supporting metrics, filters, side queues */
  secondaryPanel: "rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02]",

  /** TERTIARY — meta, tips, audit hints */
  tertiaryPanel:
    "rounded-[1rem] border border-white/[0.05] bg-slate-950/50",

  /** Table / data plate inside cards */
  dataPlate:
    "overflow-hidden rounded-[1rem] border border-white/[0.06] bg-slate-950/25",

  chartTrack: "h-2 overflow-hidden rounded-full bg-white/[0.06]",
  chartBarPrimary: "h-full rounded-full bg-sky-400/45",
  chartBarSecondary: "h-full rounded-full bg-emerald-400/35",
  chartBarTertiary: "h-full rounded-full bg-violet-400/35",

  labelEyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300",
  metaQuiet: "text-xs text-slate-400",

  /** Table / queue — primary copy on dark plates (WCAG AAA — STRICT operational contrast) */
  textRowPrimary: "text-slate-50 font-bold",           // Names, main titles — MAXIMUM contrast
  textRowBody: "text-slate-100 font-semibold",         // Primary data values — highest readability
  textRowSecondary: "text-slate-300 font-medium",      // Secondary metadata — raised for clarity
  textRowMeta: "text-slate-400",                       // Timestamps, IDs, supporting info
} as const;
