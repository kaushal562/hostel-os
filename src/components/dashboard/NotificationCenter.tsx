import React, { useState } from "react";
import { Bell, Filter, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";

import type { Notification, NotificationType } from "./NotificationTypes";

const filterToType: Record<string, NotificationType> = {
  urgent: "urgent",
  warning: "warning",
  info: "info",
};

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onFilterChange?: (filter: string) => void;
}



const NotificationCenter = ({
  notifications,
  onNotificationClick = () => {},
  onMarkAsRead = () => {},
  onFilterChange = () => {},
}: NotificationCenterProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const getFilteredNotifications = () => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") {
      return notifications.filter((n) => !n.is_read);
    }

    const filterType = filterToType[activeFilter];
    if (!filterType) return notifications;

    return notifications.filter((n) => n.type === filterType);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "default";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filterBtn = (active: boolean) =>
    active
      ? "border-white/[0.14] bg-white/[0.09] text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "border-white/[0.09] bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:border-white/[0.11]";

  return (
    <Card className="workspace-surface-panel h-full w-full">
      <CardHeader className="workspace-surface-panel-header flex flex-row items-center justify-between pb-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 gap-y-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-violet-900/55 to-indigo-950/50 text-violet-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-[1.0625rem] font-semibold tracking-tight text-slate-50">
              Notifications
            </CardTitle>
            <p className="text-[11px] font-medium text-slate-500">Operational broadcasts</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="border-white/[0.12] bg-white/[0.08] text-[11px] font-semibold uppercase tracking-wide text-slate-200 hover:bg-white/10">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 text-[12px] font-medium text-slate-400 hover:bg-white/[0.06] hover:text-slate-200">
          <Filter className="mr-1 h-4 w-4 opacity-90" strokeWidth={1.75} /> Filters
        </Button>
      </CardHeader>

      <div className="flex gap-2 overflow-x-auto px-6 pb-3 pt-4">
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 rounded-full ${filterBtn(activeFilter === "all")}`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 rounded-full ${filterBtn(activeFilter === "unread")}`}
          onClick={() => handleFilterChange("unread")}
        >
          Unread
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 rounded-full ${filterBtn(activeFilter === "urgent")}`}
          onClick={() => handleFilterChange("urgent")}
        >
          Urgent
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 rounded-full ${filterBtn(activeFilter === "warning")}`}
          onClick={() => handleFilterChange("warning")}
        >
          Warnings
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 rounded-full ${filterBtn(activeFilter === "info")}`}
          onClick={() => handleFilterChange("info")}
        >
          Info
        </Button>
      </div>

      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6 pb-6">
          <div className="mt-2 space-y-3">
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`cursor-pointer rounded-xl border p-3 transition hover:border-white/[0.12] hover:bg-white/[0.05] ${
                    notification.is_read
                      ? "border-white/[0.085] bg-white/[0.03]"
                      : "border-l-[3px] border-l-indigo-400/55 border-white/[0.08] bg-white/[0.048] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  }`}
                  onClick={() => onNotificationClick(notification)}
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <h4 className="flex flex-wrap items-center gap-2 text-[13px] font-semibold leading-snug text-slate-100">
                      {notification.title}
                      <Badge
                        variant={getTypeColor(notification.type)}
                        className="border-white/10 bg-white/[0.06] text-[10px] uppercase tracking-wide text-slate-200"
                      >
                        {notification.type}
                      </Badge>
                    </h4>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-medium tabular-nums text-slate-500">
                        {formatDate(notification.date)}
                      </span>
                      {notification.is_read && (
                        <CheckCircle className="h-4 w-4 text-emerald-400/90" />
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 px-2 text-[11px] font-medium text-indigo-200/90 hover:bg-white/[0.06] hover:text-indigo-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 py-8 text-center text-slate-500">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
                  <Bell className="h-5 w-5 text-slate-600 opacity-80" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-slate-400">No notices in this filter</p>
                <p className="max-w-[280px] text-[12px] leading-relaxed text-slate-500">
                  Adjust filters or check back later—broadcasts and policy updates arrive here when admins publish them.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
