import React, { useState } from "react";

import { Home, Users, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import RoommateAvatar from "./RoommateAvatar";
import { type RoommateInfo, useRoommates } from "@/hooks/useRoommates";

interface RoomDetailsCardProps {
  roomNumber?: string;
  roomType?: string;
  floor?: string;
  block?: string;
  /**
   * When set, the card renders roommates as-if this profile is the viewer.
   * This is required for admin "student view" so we never use the admin's
   * own allocation or id for roommate logic.
   */
  viewerProfileId?: string;
  roommates?: RoommateInfo[];
  onRoomChangeRequest?: () => void;
}

function normalizeRoomNumber(v?: string | null) {
  // " E-503 " / "e-503" / "E - 503" -> "E-503"
  return (v ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

function normalizeBlock(v?: string | null) {
  return (v ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

function normalizeFloor(v?: string | null) {
  // "5th" / " 5TH " -> "5th" (keep suffix but normalize case/whitespace)
  const s = (v ?? "").trim().replace(/\s+/g, "");
  return s ? s.toLowerCase() : "";
}

const RoomDetailsCard = ({
  roomNumber,
  roomType,
  floor,
  block,
  viewerProfileId,
  roommates: initialRoommates,
  onRoomChangeRequest = () => {},
}: RoomDetailsCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { roommates, isLoading } = useRoommates({
    roomNumber,
    block,
    floor,
    roomType,
    viewerProfileId,
    initialRoommates,
  });

  const getRoomTypeLabel = (raw?: string) => {
    const v = (raw || "").toLowerCase().trim();
    if (v === "single") return "Single";
    if (v === "double") return "Double";
    if (v === "triple") return "Triple";
    if (v === "quad") return "Quad";
    return raw?.trim() ? raw.trim() : null;
  };

  return (
    <Card className="workspace-surface-panel relative h-full w-full overflow-hidden">

      <CardHeader className="workspace-surface-panel-header pb-3">
        <CardTitle className="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-tight text-slate-50">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-slate-700/45 to-indigo-950/50 text-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Home className="h-4 w-4" strokeWidth={1.75} />
          </span>
          Room details
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-white/[0.12]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Room number</p>
              {roomNumber ? (
                <p className="mt-0.5 font-mono text-xs font-semibold text-slate-100">{roomNumber}</p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-slate-500">Not assigned</p>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-white/[0.12]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Room type</p>
              {getRoomTypeLabel(roomType) ? (
                <p className="mt-0.5 text-xs font-semibold text-slate-100">{getRoomTypeLabel(roomType)}</p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-slate-500">Pending allocation</p>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-white/[0.12]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Floor</p>
              {floor ? (
                <p className="mt-0.5 text-xs font-semibold capitalize text-slate-100">{floor}</p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-slate-500">Pending allocation</p>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-white/[0.12]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Block</p>
              {block ? (
                <p className="mt-0.5 text-xs font-semibold uppercase text-slate-100">{block}</p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-slate-500">Pending allocation</p>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h3 className="mb-2 flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <Users className="mr-2 h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
              Roommates
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400/80" />
              </div>
            ) : roommates.length > 0 ? (
              <div className="space-y-1.5">
                {roommates.map((roommate) => (
                  <div
                    key={roommate.id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <div className="flex-shrink-0">
                      <RoommateAvatar
                        fullName={roommate.full_name}
                        imageUrl={roommate.profile_picture}
                        seed={roommate.id}
                        className="h-7 w-7"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-100">{roommate.full_name}</p>
                      {roommate.student_id ? (
                        <p className="text-xs text-slate-500">{roommate.student_id}</p>
                      ) : (
                        <p className="text-xs text-slate-500">Student</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.025] px-4 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.04] text-slate-500">
                  <Users className="h-4 w-4 opacity-90" strokeWidth={1.65} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-300">No co-residents linked</p>
                  <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-relaxed text-slate-500">
                    Others assigned to your room appear here automatically—your room activity stays in one view.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/5 pt-3">
        {/* Simplified UX: directly open the actual RoomChangeForm modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-xl border-white/15 bg-white/[0.04] text-sm text-slate-100 hover:bg-white/[0.07]"
              onClick={() => {
                setIsDialogOpen(false);
                onRoomChangeRequest();
              }}
            >
              Request room change
              <ArrowRight className="ml-2 h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default RoomDetailsCard;

