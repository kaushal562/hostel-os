export type NotificationType = "info" | "warning" | "urgent";

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  is_read: boolean;
  type: NotificationType;
}

