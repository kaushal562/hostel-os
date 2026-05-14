import React from "react";
import { PremiumModal } from "@/components/shared/PremiumFormsAndModals";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { Home, Phone, BookOpen, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import RoommatesCompactList from "@/components/shared/RoommatesCompactList";

interface StudentProfile {
  id: string;
  full_name: string | null;
  student_id: string | null;
  course: string | null;
  year: string | null;
  room_number: string | null;
  room_type: string | null;
  block: string | null;
  floor: string | null;
  contact_number: string | null;
  emergency_contact: string | null;
  profile_picture: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentProfile | null;
  onEdit: () => void;
}

const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  open,
  onOpenChange,
  student,
  onEdit,
}) => {
  if (!student) return null;

  return (
    <PremiumModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Student Dossier"
      subtitle="Comprehensive administrative intelligence profile."
      size="lg"
    >
      <div className="space-y-6">
        <ScrollArea className="max-h-[70vh] pr-6 -mr-6">
          <div className="flex flex-col space-y-8 py-4 px-1">
            <div className="flex items-center space-x-5 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
              <UserAvatar
                name={student.full_name}
                imageUrl={student.profile_picture}
                seed={student.student_id || student.id}
                className="h-16 w-16 text-lg border-2 border-indigo-500/20 ring-4 ring-indigo-500/5 shadow-xl"
              />
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold text-slate-50 tracking-tight">
                  {student.full_name || "Unnamed Student"}
                </h3>
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="opacity-50">UID:</span>
                  <span className="font-mono text-slate-300">{student.student_id || "NOT_ASSIGNED"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <BookOpen className="h-3.5 w-3.5" /> Academic Profile
                </h4>
                <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-500 font-medium">Course</span>
                    <span className="text-[13px] font-bold text-slate-200">
                      {student.course || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-500 font-medium">Batch Year</span>
                    <span className="text-[13px] font-bold text-slate-200">
                      {student.year || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-white/[0.04]">
                    <span className="text-[12px] text-slate-500 font-medium">Joined On</span>
                    <span className="text-[12px] font-bold text-slate-400 tabular-nums">
                      {student.created_at
                        ? new Date(student.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Home className="h-3.5 w-3.5" /> Room Allocation
                </h4>
                <div className="bg-white/[0.03] p-4 rounded-xl border border-indigo-500/10 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-500 font-medium">Room No.</span>
                    <span className="text-[13px] font-bold text-slate-100">
                      {student.room_number || "UNALLOCATED"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-500 font-medium">Room Config</span>
                    <span className="text-[13px] font-bold text-slate-200 capitalize">
                      {student.room_type || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-500 font-medium">Block / Floor</span>
                    <span className="text-[12px] font-bold text-slate-200 uppercase">
                      {student.block ? `Block ${student.block}` : "—"}
                      {student.floor ? ` · ${student.floor}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Phone className="h-3.5 w-3.5" /> Emergency Contacts
              </h4>
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Primary Contact</p>
                  <p className="text-[13px] font-bold text-slate-200 tabular-nums">
                    {student.contact_number || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Emergency / Guardian</p>
                  <p className="text-[13px] font-bold text-slate-200 tabular-nums">
                    {student.emergency_contact || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <User className="h-3.5 w-3.5" /> Roommates Ledger
              </h4>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                <RoommatesCompactList
                  viewerProfileId={student.id}
                  roomNumber={student.room_number}
                  roomType={student.room_type}
                  block={student.block}
                  floor={student.floor}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 gap-3 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
          >
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-500/20 mt-3 sm:mt-0"
          >
            Edit Student Profile
          </Button>
        </div>
      </div>
    </PremiumModal>
  );
};

export default StudentDetailsDialog;

