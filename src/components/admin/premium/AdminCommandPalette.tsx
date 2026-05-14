import React, { useCallback, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { LogOut, Search } from "lucide-react";
import clsx from "clsx";
import { ADMIN_WORKSPACE_NAV, type AdminNavId } from "./AdminWorkspaceShell";

function isEditableEventTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.closest("[data-no-command-palette]")) return true;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  const role = el.getAttribute("role");
  if (role === "textbox" || role === "combobox" || role === "searchbox") return true;
  return Boolean(el.closest("input, textarea, select, [contenteditable='true']"));
}

export function AdminCommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onLogout,
  activeNav,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: AdminNavId) => void;
  onLogout: () => void;
  activeNav: AdminNavId;
}) {
  const openRef = useRef(open);
  openRef.current = open;

  const toggle = useCallback(() => {
    onOpenChange(!openRef.current);
  }, [onOpenChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "KeyK" || (!e.metaKey && !e.ctrlKey)) return;
      if (isEditableEventTarget(e.target)) return;
      e.preventDefault();
      toggle();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [toggle]);

  const handleSelect = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={clsx(
            "fixed inset-0 z-[220] bg-black/55 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150",
          )}
        />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className={clsx(
            "fixed left-1/2 top-[max(4rem,12vh)] z-[221] w-[min(100vw-1.5rem,36rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#0c1118] shadow-2xl shadow-black/50 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] duration-150",
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">Admin command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search or jump to a workspace section. Press escape to close.
          </DialogPrimitive.Description>

          <Command label="Admin command menu" shouldFilter loop className="flex h-full flex-col">
            <div className="flex items-center border-b border-white/5 px-3 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
              <Command.Input
                placeholder="Jump to module or run an action…"
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                Esc
              </span>
            </div>

            <Command.List className="max-h-[min(52vh,22rem)] overflow-y-auto overscroll-contain p-1.5 custom-scrollbar">
              <Command.Empty className="px-3 py-8 text-center text-sm text-slate-500">No matches.</Command.Empty>

              <Command.Group
                heading="Workspace"
                className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5"
              >
                {ADMIN_WORKSPACE_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.id}`}
                      onSelect={() => handleSelect(() => onNavigate(item.id))}
                      className={clsx(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors duration-100",
                        "data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-slate-50",
                        active ? "text-slate-100" : "text-slate-300",
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.03] text-slate-500">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </div>
                      <span className="flex-1 font-medium tracking-tight">{item.label}</span>
                      {active ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/90">Current</span>
                      ) : null}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              <Command.Group
                heading="Account"
                className="mt-0.5 border-t border-white/5 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5"
              >
                <Command.Item
                  value="Log out sign out"
                  onSelect={() => handleSelect(onLogout)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400/95 outline-none transition-colors duration-100 data-[selected=true]:bg-red-500/10 data-[selected=true]:text-red-200"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.03] text-red-400/90">
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <span className="flex-1 font-medium tracking-tight">Log out</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] text-slate-500 sm:px-4">
              <div className="flex gap-3 sm:gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 font-sans">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 font-sans">↵</kbd>
                  run
                </span>
              </div>
              <span className="hidden sm:inline">⌘K</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
