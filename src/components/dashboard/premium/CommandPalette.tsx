import React, { useCallback, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import {
  DoorOpen,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquareWarning,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import clsx from "clsx";
import { StudentNavId } from "./StudentWorkspaceShell";

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: StudentNavId) => void;
  onLogout: () => void;
  onUpdateProfile: () => void;
  onRequestRoomChange: () => void;
  onSubmitComplaint: () => void;
  onPayFees: () => void;
}

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

export function CommandPalette({
  isOpen,
  onOpenChange,
  onNavigate,
  onLogout,
  onUpdateProfile,
  onRequestRoomChange,
  onSubmitComplaint,
  onPayFees,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

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

  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearch("");
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={clsx(
            "fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150",
          )}
        />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className={clsx(
            "fixed left-1/2 top-[max(4rem,12vh)] z-[201] w-[min(100vw-1.5rem,36rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#0c1118] shadow-2xl shadow-black/40 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] duration-150 ease-out",
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">Student workspace command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search or jump to a section. Press escape to close.
          </DialogPrimitive.Description>

          <Command label="Command menu" shouldFilter loop className="flex h-full flex-col">
            <div className="flex items-center border-b border-white/5 px-3 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
              <Command.Input
                placeholder="Jump to section or run an action…"
                value={search}
                onValueChange={setSearch}
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
                <CommandItem
                  icon={LayoutDashboard}
                  label="Overview"
                  onSelect={() => handleSelect(() => onNavigate("overview"))}
                />
                <CommandItem
                  icon={DoorOpen}
                  label="Room details"
                  onSelect={() => handleSelect(() => onNavigate("room"))}
                />
                <CommandItem
                  icon={IndianRupee}
                  label="Fees & ledger"
                  onSelect={() => handleSelect(() => onNavigate("fees"))}
                />
                <CommandItem
                  icon={MessageSquareWarning}
                  label="Complaints"
                  onSelect={() => handleSelect(() => onNavigate("complaints"))}
                />
                <CommandItem
                  icon={Megaphone}
                  label="Notices"
                  onSelect={() => handleSelect(() => onNavigate("notices"))}
                />
                <CommandItem
                  icon={Sparkles}
                  label="Quick actions"
                  onSelect={() => handleSelect(() => onNavigate("actions"))}
                />
              </Command.Group>

              <Command.Group
                heading="Actions"
                className="mt-0.5 border-t border-white/5 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5"
              >
                <CommandItem
                  icon={Sparkles}
                  label="Request room change"
                  onSelect={() => handleSelect(onRequestRoomChange)}
                />
                <CommandItem
                  icon={MessageSquareWarning}
                  label="Submit complaint"
                  onSelect={() => handleSelect(onSubmitComplaint)}
                />
                <CommandItem
                  icon={IndianRupee}
                  label="Open fee settlement"
                  onSelect={() => handleSelect(onPayFees)}
                />
              </Command.Group>

              <Command.Group
                heading="Account"
                className="mt-0.5 border-t border-white/5 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5"
              >
                <CommandItem
                  icon={User}
                  label="Update profile"
                  onSelect={() => handleSelect(onUpdateProfile)}
                />
                <CommandItem
                  icon={LogOut}
                  label="Log out"
                  onSelect={() => handleSelect(onLogout)}
                  danger
                />
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

function CommandItem({
  icon: Icon,
  label,
  onSelect,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className={clsx(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors duration-100",
        "data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-slate-50",
        danger
          ? "text-red-400/95 data-[selected=true]:bg-red-500/10 data-[selected=true]:text-red-200"
          : "text-slate-300",
      )}
    >
      <div
        className={clsx(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.03]",
          danger ? "text-red-400/90" : "text-slate-500",
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
      <span className="flex-1 font-medium tracking-tight">{label}</span>
    </Command.Item>
  );
}
