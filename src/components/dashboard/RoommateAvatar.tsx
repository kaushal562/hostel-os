import React from "react";
import UserAvatar from "@/components/ui/UserAvatar";

function getInitials(fullName: string) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase() || "?";
}

export default function RoommateAvatar({
  fullName,
  imageUrl,
  seed,
  className,
}: {
  fullName: string;
  imageUrl?: string | null;
  seed: string;
  className?: string;
}) {
  // UserAvatar already renders an avatar; we just keep initials deterministic.
  return (
    <UserAvatar
      name={fullName}
      imageUrl={imageUrl ?? null}
      seed={seed}
      className={className}
      // fallback is handled inside UserAvatar
    />
  );
}

