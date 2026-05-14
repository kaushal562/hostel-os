import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, AlertCircle, User, Calendar, MapPin, MessageSquare } from "lucide-react";

interface ComplaintReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: any;
  onStatusUpdate?: () => void;
}

const ComplaintReviewDialog = ({
  open,
  onOpenChange,
  complaint,
  onStatusUpdate,
}: ComplaintReviewDialogProps) => {
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!complaint) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("complaints")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", complaint.id);

      if (error) throw error;
      
      if (onStatusUpdate) onStatusUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating complaint status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold tracking-wider">PENDING</Badge>;
      case "in-progress":
        return <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 font-bold tracking-wider">IN PROGRESS</Badge>;
      case "resolved":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold tracking-wider">RESOLVED</Badge>;
      case "rejected":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold tracking-wider">REJECTED</Badge>;
      default:
        return <Badge variant="outline" className="border-white/20 text-slate-400 font-bold tracking-wider">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] bg-slate-950/95 border-white/[0.08] backdrop-blur-xl text-slate-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]">
        <DialogHeader className="border-b border-white/[0.06] pb-5 mb-2">
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-50">{complaint.title}</DialogTitle>
            {getStatusBadge(complaint.status)}
          </div>
          <DialogDescription className="text-slate-500 font-medium">
            Submitted on {formatDate(complaint.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 text-[13px] text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
              <User className="h-4 w-4 text-indigo-400" />
              <span className="font-medium">Student ID:</span>
              <span className="font-mono text-slate-200">{complaint.user_id?.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span className="font-medium">Location:</span>
              <span className="text-slate-200">{complaint.location || "Not specified"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> Incident Description
            </Label>
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[13px] leading-relaxed text-slate-300 min-h-[100px]">
              {complaint.description}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="remarks" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Remarks (Internal)</Label>
            <Textarea
              id="remarks"
              placeholder="Add internal notes or response to the student..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[96px] bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-3 pt-6 border-t border-white/[0.06] mt-4">
          <div className="flex gap-3 w-full sm:w-auto">
            {complaint.status !== "resolved" && (
              <Button
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 flex-1 sm:flex-none shadow-lg shadow-indigo-500/20"
                onClick={() => handleUpdateStatus("resolved")}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Resolved
              </Button>
            )}
            {complaint.status === "pending" && (
              <Button
                variant="outline"
                className="border-sky-500/30 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10 flex-1 sm:flex-none font-semibold"
                onClick={() => handleUpdateStatus("in-progress")}
                disabled={isUpdating}
              >
                <Clock className="h-4 w-4 mr-2" />
                Start Progress
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
            className="text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintReviewDialog;
