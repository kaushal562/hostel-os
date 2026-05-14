import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Home, User } from "lucide-react";

interface QuickActionsProps {
  onPayFees?: () => void;
  onSubmitComplaint?: () => void;
  onRequestRoomChange?: () => void;
  onUpdateProfile?: () => void;
}

const QuickActions = ({
  onPayFees = () => {},
  onSubmitComplaint = () => {},
  onRequestRoomChange = () => {},
  onUpdateProfile = () => {},
}: QuickActionsProps) => {
  return (
    <div className="workspace-surface-panel w-full p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Shortcuts
          </p>
          <h2 className="mt-1 text-[1.0625rem] font-semibold tracking-tight text-slate-50">Quick actions</h2>
          <p className="mt-1 max-w-[40ch] text-[12px] leading-relaxed text-slate-500">
            Jump into common hostel workflows—same paths as navigation, surfaced for speed.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={onPayFees}
          className="flex min-h-[112px] min-w-[200px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-white/[0.11] bg-white/[0.04] py-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-white/[0.16] hover:bg-white/[0.065]"
          variant="outline"
        >
          <CreditCard className="h-6 w-6 text-cyan-200" strokeWidth={1.75} />
          <span className="text-sm font-medium">Pay fees</span>
        </Button>

        <Button
          onClick={onSubmitComplaint}
          className="flex min-h-[112px] min-w-[200px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-white/[0.11] bg-white/[0.04] py-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-white/[0.16] hover:bg-white/[0.065]"
          variant="outline"
        >
          <FileText className="h-6 w-6 text-violet-200" strokeWidth={1.75} />
          <span className="text-sm font-medium">Submit complaint</span>
        </Button>

        <Button
          onClick={onRequestRoomChange}
          className="flex min-h-[112px] min-w-[200px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-white/[0.11] bg-white/[0.04] py-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-white/[0.16] hover:bg-white/[0.065]"
          variant="outline"
        >
          <Home className="h-6 w-6 text-fuchsia-200" strokeWidth={1.75} />
          <span className="text-sm font-medium">Request room change</span>
        </Button>

        <Button
          onClick={onUpdateProfile}
          className="flex min-h-[112px] min-w-[200px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-white/[0.11] bg-white/[0.04] py-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-white/[0.16] hover:bg-white/[0.065]"
          variant="outline"
        >
          <User className="h-6 w-6 text-emerald-200" strokeWidth={1.75} />
          <span className="text-sm font-medium">Update profile</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
