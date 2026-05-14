import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PlusCircle, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Complaint {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  description: string;
}

interface ComplaintsCardProps {
  complaints?: Complaint[];
  onNewComplaint?: () => void;
  onViewComplaint?: (id: string) => void;
}

const ComplaintsCard = ({
  complaints = [],
  onNewComplaint = () => {},
  onViewComplaint = () => {},
}: ComplaintsCardProps) => {
  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.09]">
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="border-cyan-500/35 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20">
            In progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="border-emerald-500/35 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20">
            Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="border-red-500/40 bg-red-500/15 text-red-100 hover:bg-red-500/25">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="border-white/15 bg-white/[0.06] text-slate-300">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card className="workspace-surface-panel flex h-full w-full flex-col overflow-hidden">
      <CardHeader className="workspace-surface-panel-header pb-3">
        <CardTitle className="flex items-center justify-between gap-3 text-[1.0625rem] font-semibold tracking-tight text-slate-50">
          <div>
            <span className="block">Recent complaints</span>
            <span className="mt-1 block text-[11px] font-medium text-slate-500">Desk tickets you’ve raised</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-lg text-indigo-200/95 hover:bg-white/[0.06] hover:text-indigo-100"
            onClick={onNewComplaint}
          >
            <PlusCircle className="mr-1 h-4 w-4" strokeWidth={1.75} />
            New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto pt-4">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.035] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <AlertCircle className="h-5 w-5 opacity-90" strokeWidth={1.6} />
            </div>
            <p className="text-[13px] font-semibold tracking-tight text-slate-300">No complaints submitted yet</p>
            <p className="mt-1.5 max-w-[268px] text-[12px] leading-relaxed text-slate-500">
              When maintenance or hostel issues arise, submit a complaint and track status transparently—the queue
              starts here.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 border-white/[0.12] bg-white/[0.04] text-[13px] font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/[0.075]"
              onClick={onNewComplaint}
            >
              Submit a complaint
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/[0.11] hover:bg-white/[0.05]"
                onClick={() => onViewComplaint(complaint.id)}
              >
                <div className="mb-0.5 flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-semibold leading-snug text-slate-100">{complaint.title}</h4>
                  {getStatusBadge(complaint.status)}
                </div>
                <p className="truncate text-[12px] leading-snug text-slate-500">
                  {complaint.description}
                </p>
                <p className="mt-1 text-[11px] font-medium tabular-nums text-slate-600">
                  {formatDate(complaint.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-3">
        {complaints.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/[0.07]"
            onClick={onNewComplaint}
          >
            Submit new complaint
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ComplaintsCard;
