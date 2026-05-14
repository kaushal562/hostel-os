import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, User, MessageSquare, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";

interface RoomRequest {
  id: string;
  status: string;
  date: string;
  studentName: string;
  student_id: string;
  currentRoom: string;
  requestedType: string;
  preferred_floor?: string;
  reason: string;
  roommate_preference?: string;
  admin_remarks?: string;
  user_id?: string;
}

interface RoomRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RoomRequest | null;
  onApprove: (
    requestId: string,
    remarks: string,
    allocation: { room_number: string; floor: string; block: string },
  ) => Promise<void>;
  onReject: (requestId: string, remarks: string) => Promise<void>;
}

const RoomRequestDetailsDialog: React.FC<RoomRequestDetailsDialogProps> = ({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
}) => {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");

  useEffect(() => {
    if (!open) return;
    setRemarks("");
    setRoomNumber("");
    setBlock("");
    setFloor("");
  }, [open, request?.id]);

  if (!request) return null;

  const handleAction = async (action: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      if (action === "approve") {
        await onApprove(request.id, remarks, {
          room_number: roomNumber.trim(),
          floor: floor.trim(),
          block: block.trim(),
        });
      } else {
        await onReject(request.id, remarks);
      }
      onOpenChange(false);
      setRemarks("");
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] bg-slate-950/95 border-white/[0.08] backdrop-blur-xl text-slate-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]">
        <DialogHeader className="border-b border-white/[0.06] pb-5 mb-2">
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-xl flex items-center gap-2.5 font-bold tracking-tight text-slate-50">
              <Building className="h-5 w-5 text-indigo-400" />
              Room Change Request
            </DialogTitle>
            {getStatusBadge(request.status)}
          </div>
          <DialogDescription className="text-slate-500 font-medium">
            Submitted on {formatDate(request.date)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6 -mr-6">
          <div className="space-y-6 py-4 px-1">
            {/* Student Info Section */}
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Student Information
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-100 text-right">{request.studentName}</span>
                <span className="text-slate-500">Student ID</span>
                <span className="font-mono text-[13px] text-slate-300 text-right">{request.student_id || "N/A"}</span>
                <span className="text-slate-500">Current Allocation</span>
                <span className="font-semibold text-slate-200 text-right">{request.currentRoom}</span>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-500/[0.04] p-4 rounded-xl border border-indigo-500/20">
                <h4 className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest mb-2">Requested Type</h4>
                <p className="text-xl font-bold text-slate-50 capitalize">{request.requestedType}</p>
              </div>
              <div className="bg-violet-500/[0.04] p-4 rounded-xl border border-violet-500/20">
                <h4 className="text-[10px] font-black text-violet-400/80 uppercase tracking-widest mb-2">Preferred Floor</h4>
                <p className="text-xl font-bold text-slate-50 capitalize">{request.preferred_floor || "Any"}</p>
              </div>
            </div>

            {/* Reason Section */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Reason for Request
              </h4>
              <div className="text-sm leading-relaxed text-slate-300 bg-white/[0.02] p-4 border border-white/[0.06] rounded-xl min-h-[72px]">
                {request.reason}
              </div>
            </div>

            {/* Roommate Preference Section */}
            {request.roommate_preference && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> Roommate Preference
                </h4>
                <div className="text-sm leading-relaxed text-slate-300 bg-white/[0.02] p-4 border border-white/[0.06] rounded-xl">
                  {request.roommate_preference}
                </div>
              </div>
            )}

            {/* Admin Remarks Section (Only if pending) */}
            {request.status === "pending" && (
              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Remarks (Internal)</h4>
                <Textarea
                  placeholder="Add notes about this decision..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-[96px] bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
              </div>
            )}

            {/* Allocation Section (Only if pending) */}
            {request.status === "pending" && (
              <div className="bg-white/[0.03] p-5 rounded-xl border border-indigo-500/20">
                <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5" /> Allocate Room (Required)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Block</label>
                    <Select value={block} onValueChange={setBlock}>
                      <SelectTrigger className="bg-slate-950/50 border-white/[0.1] text-slate-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
                        <SelectItem value="A">Block A</SelectItem>
                        <SelectItem value="B">Block B</SelectItem>
                        <SelectItem value="C">Block C</SelectItem>
                        <SelectItem value="D">Block D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Floor</label>
                    <Select value={floor} onValueChange={setFloor}>
                      <SelectTrigger className="bg-slate-950/50 border-white/[0.1] text-slate-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
                        <SelectItem value="ground">Ground</SelectItem>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                        <SelectItem value="third">Third</SelectItem>
                        <SelectItem value="fourth">Fourth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Room No.</label>
                    <Input
                      placeholder="e.g. 204"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      inputMode="numeric"
                      className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/[0.03]">
                  Note: Roommates are detected by matching <span className="font-semibold text-slate-400 underline decoration-indigo-500/50">room_number + block + floor</span>.
                </p>
              </div>
            )}

            {/* Existing Remarks Section (If already processed) */}
            {request.admin_remarks && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Admin Remarks</h4>
                <div className="text-sm text-slate-400 bg-white/[0.02] p-4 border border-white/[0.06] rounded-xl italic">
                  {request.admin_remarks}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-3 pt-6 border-t border-white/[0.06] mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </Button>
          {request.status === "pending" && (
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="destructive" 
                onClick={() => handleAction("reject")}
                disabled={isSubmitting}
                className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-semibold"
              >
                Reject Request
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold px-6" 
                onClick={() => handleAction("approve")}
                disabled={
                  isSubmitting ||
                  !block.trim() ||
                  !floor.trim() ||
                  !roomNumber.trim()
                }
              >
                Approve & Reassign
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomRequestDetailsDialog;
