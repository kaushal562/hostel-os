import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type RoommateInfo = {
  full_name: string;
  id: string;
  student_id?: string | null;
  profile_picture?: string | null;
};

export function normalizeRoomNumber(v?: string | null) {
  // " E-503 " / "e-503" / "E - 503" -> "E-503"
  return (v ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

export function normalizeBlock(v?: string | null) {
  return (v ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

export function normalizeFloor(v?: string | null) {
  // "5th" / " 5TH " -> "5th" (keep suffix but normalize case/whitespace)
  const s = (v ?? "").trim().replace(/\s+/g, "");
  return s ? s.toLowerCase() : "";
}

type UseRoommatesArgs = {
  roomNumber?: string | null;
  block?: string | null;
  floor?: string | null;
  roomType?: string | null;
  /**
   * When set, roommates are computed as-if this profile is the viewer.
   * This is required for admin view/details so we never use the admin's
   * own id/allocation for roommate logic.
   */
  viewerProfileId?: string;
  initialRoommates?: RoommateInfo[];
};

export function useRoommates({
  roomNumber,
  block,
  floor,
  roomType,
  viewerProfileId,
  initialRoommates,
}: UseRoommatesArgs) {
  const [roommates, setRoommates] = useState<RoommateInfo[]>(() => initialRoommates ?? []);
  const [isLoading, setIsLoading] = useState(false);

  // Track latest props/user without recreating realtime subscriptions
  const latestRoomFilter = useRef({ roomNumber, block, floor, roomType });
  const latestUserId = useRef<string | null>(null);

  // Prevent unnecessary refetch spam on rapid realtime bursts
  const refreshInFlightRef = useRef(false);
  const pendingRefreshRef = useRef(false);

  useEffect(() => {
    // Keep ref values normalized to avoid stale/mismatched comparisons.
    latestRoomFilter.current = {
      roomNumber: normalizeRoomNumber(roomNumber),
      block: normalizeBlock(block),
      floor: normalizeFloor(floor),
      roomType,
    };
  }, [roomNumber, block, floor, roomType]);

  const canQuery = useMemo(() => {
    const rn = normalizeRoomNumber(roomNumber);
    const bl = normalizeBlock(block);
    const fl = normalizeFloor(floor);
    return !!rn && !!bl && !!fl;
  }, [roomNumber, block, floor]);

  const fetchRoommates = async () => {
    setIsLoading(true);

    const propsFilter = latestRoomFilter.current;
    const rn = normalizeRoomNumber(propsFilter.roomNumber);
    const bl = normalizeBlock(propsFilter.block);
    const fl = normalizeFloor(propsFilter.floor);

    if (!rn || !bl || !fl) {
      setRoommates([]);
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setRoommates([]);
        return;
      }

      const viewerId = viewerProfileId ?? session.user.id;
      latestUserId.current = viewerId;

      // Source of truth: derive effective allocation from the viewer's profile.
      const { data: viewerProfile } = await supabase
        .from("profiles")
        .select("id, room_number, block, floor, role")
        .eq("id", viewerId)
        .maybeSingle();

      const effectiveRoomNumber = normalizeRoomNumber(viewerProfile?.room_number ?? rn);
      const effectiveBlock = normalizeBlock(viewerProfile?.block ?? bl);
      const effectiveFloor = normalizeFloor(viewerProfile?.floor ?? fl);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, student_id, profile_picture, room_number, block, floor, role")
        .eq("role", "student")
        .not("room_number", "is", null)
        .not("block", "is", null)
        .not("floor", "is", null);
      if (error) throw error;

      const filteredRows = (data || []).filter((row: any) => {
        const rowRn = normalizeRoomNumber(row.room_number);
        const rowBl = normalizeBlock(row.block);
        const rowFl = normalizeFloor(row.floor);
        const currentProfileId = viewerProfile?.id ?? null;
        return (
          !!row.id &&
          row.role === "student" &&
          (!currentProfileId || row.id !== currentProfileId) &&
          !!rowRn &&
          !!rowBl &&
          !!rowFl &&
          rowRn === effectiveRoomNumber &&
          rowBl === effectiveBlock &&
          rowFl === effectiveFloor
        );
      });

      setRoommates(
        filteredRows
          .map((profile: any) => ({
            full_name: profile.full_name || "",
            id: profile.id,
            student_id: profile.student_id,
            profile_picture: profile.profile_picture || null,
          }))
          .filter((r: RoommateInfo) => r.full_name)
      );
    } catch (e) {
      console.error("[useRoommates] Error fetching roommates:", e);
      setRoommates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshInFlightRef.current) {
      pendingRefreshRef.current = true;
      return;
    }

    refreshInFlightRef.current = true;
    try {
      await fetchRoommates();
    } finally {
      refreshInFlightRef.current = false;
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        await fetchRoommates();
      }
    }
  };

  // initial fetch
  useEffect(() => {
    if (!canQuery) {
      setRoommates([]);
      return;
    }
    if (initialRoommates?.length) setRoommates(initialRoommates);
    void fetchRoommates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomNumber, block, floor, roomType, viewerProfileId]);

  // Keep latestUserId fresh even before first fetch / across logins.
  useEffect(() => {
    if (viewerProfileId) {
      latestUserId.current = viewerProfileId;
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      latestUserId.current = session?.user?.id ?? null;
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [viewerProfileId]);

  // Realtime refresh based on the same relevance rules used in RoomDetailsCard.
  useEffect(() => {
    let isMounted = true;
    const { roomNumber: rn, block: bl, floor: fl } = latestRoomFilter.current;
    if (!rn || !bl || !fl) return;

    const channel = supabase
      .channel("roommates-profiles-relevant-changes")
      .on(
        "postgres_changes",
        { schema: "public", table: "profiles", event: "*" },
        (payload) => {
          if (!isMounted) return;

          const newRow: any = payload.new || {};
          const oldRow: any = payload.old || {};

          const relevantFields = ["room_number", "block", "floor", "room_type"] as const;
          const relevantAllocationChanged = relevantFields.some((f) => newRow[f] !== oldRow[f]);

          const changedProfileId = newRow?.id || oldRow?.id;
          const currentUserId = latestUserId.current;
          const isCurrentUserProfileChange = !!currentUserId && changedProfileId === currentUserId;

          const { roomNumber: curRn, block: curBl, floor: curFl } = latestRoomFilter.current;

          const matchesCurrentFilter = (row: any) => {
            if (!row) return false;
            return (
              normalizeRoomNumber(row.room_number) === normalizeRoomNumber(curRn) &&
              normalizeBlock(row.block) === normalizeBlock(curBl) &&
              normalizeFloor(row.floor) === normalizeFloor(curFl)
            );
          };

          const movedIntoOrOutOfRoom =
            relevantAllocationChanged && (matchesCurrentFilter(newRow) || matchesCurrentFilter(oldRow));

          if (!isCurrentUserProfileChange && !movedIntoOrOutOfRoom) return;
          void refresh();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { roommates, isLoading, refresh, canQuery };
}

