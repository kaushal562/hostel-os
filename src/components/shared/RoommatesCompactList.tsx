import React from "react";
import { Users } from "lucide-react";
import RoommateAvatar from "@/components/dashboard/RoommateAvatar";
import { useRoommates } from "@/hooks/useRoommates";

export default function RoommatesCompactList({
  roomNumber,
  block,
  floor,
  roomType,
  viewerProfileId,
}: {
  roomNumber?: string | null;
  block?: string | null;
  floor?: string | null;
  roomType?: string | null;
  viewerProfileId: string;
}) {
  const { roommates, isLoading, canQuery } = useRoommates({
    roomNumber,
    block,
    floor,
    roomType,
    viewerProfileId,
  });

  if (!canQuery) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center gap-2 bg-gray-50 rounded-md border border-gray-100">
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
          <Users className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-gray-600">No roommates assigned</p>
        <p className="text-xs text-gray-400">Assign the student to a room to see roommates.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!roommates.length) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center gap-2 bg-gray-50 rounded-md border border-gray-100">
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
          <Users className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-gray-600">No roommates assigned</p>
        <p className="text-xs text-gray-400">Roommates will appear automatically once assigned to the same room.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {roommates.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 p-2.5 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RoommateAvatar
            fullName={r.full_name}
            imageUrl={r.profile_picture}
            seed={r.id}
            className="h-9 w-9"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{r.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{r.student_id || "Student"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

