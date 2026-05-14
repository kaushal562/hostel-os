import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin } from "lucide-react";

interface NotificationDetailProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  notification?: {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location?: string;
    isImportant?: boolean;
  };
  onMarkAsRead?: () => void;
}

const NotificationDetail = ({
  isOpen = true,
  onOpenChange,
  notification,
  onMarkAsRead,
}: NotificationDetailProps) => {
  const formattedDate = notification?.date
    ? new Date(notification.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const safeTime = notification?.time ?? "";
  const safeTitle = notification?.title ?? "Notification";
  const safeDescription = notification?.description ?? "";
  const safeLocation = notification?.location;
  const isImportant = !!notification?.isImportant;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 md:max-w-lg">
        <DialogHeader className="border-0 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-semibold tracking-tight text-slate-50">
                  {safeTitle}
                </DialogTitle>
                {isImportant ? (
                  <span className="rounded-full border border-red-500/35 bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-200">
                    Important
                  </span>
                ) : null}
              </div>
              <DialogDescription className="text-left">
                Official hostel notice—stored in your operational timeline.
              </DialogDescription>
              <div className="space-y-2 pt-1 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
                  <span>{formattedDate}</span>
                </div>
                {safeTime ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
                    <span>{safeTime}</span>
                  </div>
                ) : null}
                {safeLocation ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
                    <span>{safeLocation}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{safeDescription}</p>
        </div>

        <DialogFooter className="mt-8 border-t border-white/5 pt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              onMarkAsRead?.();
              onOpenChange?.(false);
            }}
          >
            Mark as read
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetail;
