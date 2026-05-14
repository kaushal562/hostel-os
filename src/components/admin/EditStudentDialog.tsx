import React, { useEffect, useMemo, useState } from "react";
import { PremiumModal } from "@/components/shared/PremiumFormsAndModals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


type StudentProfile = {
  id: string;
  full_name: string | null;
  course: string | null;
  year: string | null;
  room_number: string | null;
  room_type: string | null;
  block: string | null;
  floor: string | null;
  contact_number: string | null;
  emergency_contact: string | null;
};

type FormState = {
  full_name: string;
  course: string;
  year: string;
  room_number: string;
  room_type: string;
  block: string;
  floor: string;
  contact_number: string;
  emergency_contact: string;
};

function toFormState(student: StudentProfile): FormState {
  return {
    full_name: student.full_name ?? "",
    course: student.course ?? "",
    year: student.year ?? "",
    room_number: student.room_number ?? "",
    room_type: student.room_type ?? "",
    block: student.block ?? "",
    floor: student.floor ?? "",
    contact_number: student.contact_number ?? "",
    emergency_contact: student.emergency_contact ?? "",
  };
}

function trimOrNull(v: string): string | null {
  const t = v.trim();
  return t.length ? t : null;
}

function normalizeRoomInputs(v: string) {
  // Keep it tolerant: trim only (do not force casing; RoomDetailsCard normalizes for matching).
  return v.trim();
}

type ValidationErrors = Partial<Record<keyof FormState, string>> & {
  form?: string;
};

function validate(values: FormState): ValidationErrors {
  const errors: ValidationErrors = {};

  const full_name = values.full_name.trim();
  const course = values.course.trim();
  const year = values.year.trim();

  if (!full_name) errors.full_name = "Full name is required.";
  if (!course) errors.course = "Course is required.";
  if (!year) errors.year = "Year is required.";

  const room_number = values.room_number.trim();
  const room_type = values.room_type.trim();
  const block = values.block.trim();
  const floor = values.floor.trim();

  const hasRoom = !!room_number;
  if (hasRoom) {
    if (!room_type) errors.room_type = "Room type is required when room number is set.";
    if (!block) errors.block = "Block is required when room number is set.";
    if (!floor) errors.floor = "Floor is required when room number is set.";
  }

  // If any room fields are partially set, require a full allocation.
  const hasAnyRoomField = !!room_number || !!room_type || !!block || !!floor;
  if (hasAnyRoomField && !hasRoom) {
    errors.room_number = "Room number is required when setting room details.";
  }

  return errors;
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  student,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentProfile | null;
  onSaved: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(() => {
    if (!student) return null;
    return toFormState(student);
  }, [student]);

  useEffect(() => {
    if (!open || !initial) return;
    setValues(initial);
    setErrors({});
    setIsSaving(false);
  }, [open, initial]);

  if (!student || !values) return null;

  const setField = <K extends keyof FormState>(key: K, v: FormState[K]) => {
    setValues((prev) => (prev ? { ...prev, [key]: v } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }));
  };

  const save = async () => {
    if (isSaving) return;

    const next: FormState = {
      ...values,
      full_name: values.full_name.trim(),
      course: values.course.trim(),
      year: values.year.trim(),
      room_number: normalizeRoomInputs(values.room_number),
      room_type: values.room_type.trim(),
      block: values.block.trim(),
      floor: values.floor.trim(),
      contact_number: values.contact_number.trim(),
      emergency_contact: values.emergency_contact.trim(),
    };

    const vErrors = validate(next);
    if (Object.keys(vErrors).length) {
      setErrors(vErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const payload = {
        full_name: trimOrNull(next.full_name),
        course: trimOrNull(next.course),
        year: trimOrNull(next.year),
        room_number: trimOrNull(next.room_number),
        room_type: trimOrNull(next.room_type),
        block: trimOrNull(next.block),
        floor: trimOrNull(next.floor),
        contact_number: trimOrNull(next.contact_number),
        emergency_contact: trimOrNull(next.emergency_contact),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", student.id);
      if (error) throw error;

      toast({
        title: "Student updated",
        description: "Changes saved successfully.",
      });

      await onSaved();
      onOpenChange(false);
    } catch (e: any) {
      console.error("[EditStudentDialog] update failed:", e);
      const message = e?.message || "Failed to update student profile";
      setErrors((prev) => ({ ...prev, form: message }));
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!isSaving ? onOpenChange(v) : undefined)}>
      <DialogContent className="sm:max-w-[720px] bg-slate-950/95 border-white/[0.08] backdrop-blur-xl text-slate-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]">
        <DialogHeader className="border-b border-white/[0.06] pb-5 mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-50">Edit Student Profile</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Update academic info, contact details, and room allocation.
          </DialogDescription>
        </DialogHeader>

        {errors.form ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
            {errors.form}
          </div>
        ) : null}

        <ScrollArea className="max-h-[65vh] pr-6 -mr-6">
          <div className="space-y-8 py-4 px-1">
            {/* Primary Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="full_name" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full name</Label>
                <Input
                  id="full_name"
                  value={values.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  disabled={isSaving}
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
                {errors.full_name ? <p className="text-[11px] text-rose-400 ml-1">{errors.full_name}</p> : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="course" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Course</Label>
                <Input
                  id="course"
                  value={values.course}
                  onChange={(e) => setField("course", e.target.value)}
                  placeholder="e.g. MCA"
                  disabled={isSaving}
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
                {errors.course ? <p className="text-[11px] text-rose-400 ml-1">{errors.course}</p> : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="year" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Year</Label>
                <Input
                  id="year"
                  value={values.year}
                  onChange={(e) => setField("year", e.target.value)}
                  placeholder="e.g. 1st / 2nd / 3rd"
                  disabled={isSaving}
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
                {errors.year ? <p className="text-[11px] text-rose-400 ml-1">{errors.year}</p> : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="contact_number" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact number</Label>
                <Input
                  id="contact_number"
                  value={values.contact_number}
                  onChange={(e) => setField("contact_number", e.target.value)}
                  placeholder="e.g. +91 98xxxxxx"
                  disabled={isSaving}
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-2.5 md:col-span-2">
                <Label htmlFor="emergency_contact" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Emergency contact</Label>
                <Input
                  id="emergency_contact"
                  value={values.emergency_contact}
                  onChange={(e) => setField("emergency_contact", e.target.value)}
                  placeholder="e.g. Parent/Guardian number"
                  disabled={isSaving}
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Room Allocation Section */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
              <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Room Allocation Archive</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="room_number" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Room number</Label>
                  <Input
                    id="room_number"
                    value={values.room_number}
                    onChange={(e) => setField("room_number", e.target.value)}
                    placeholder="e.g. E-503"
                    disabled={isSaving}
                    className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                  />
                  {errors.room_number ? (
                    <p className="text-[11px] text-rose-400 ml-1">{errors.room_number}</p>
                  ) : (
                    <p className="text-[10px] text-slate-500 ml-1 italic">Leave empty to unassign.</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Room type</Label>
                  <Select
                    value={values.room_type || ""}
                    onValueChange={(v) => setField("room_type", v)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-white/[0.1] text-slate-200">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
                      <SelectItem value="single">Single Occupancy</SelectItem>
                      <SelectItem value="double">Double Occupancy</SelectItem>
                      <SelectItem value="triple">Triple Occupancy</SelectItem>
                      <SelectItem value="quad">Quad Occupancy</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.room_type ? <p className="text-[11px] text-rose-400 ml-1">{errors.room_type}</p> : null}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="block" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Block</Label>
                  <Input
                    id="block"
                    value={values.block}
                    onChange={(e) => setField("block", e.target.value)}
                    placeholder="e.g. E"
                    disabled={isSaving}
                    className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                  />
                  {errors.block ? <p className="text-[11px] text-rose-400 ml-1">{errors.block}</p> : null}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="floor" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Floor</Label>
                  <Input
                    id="floor"
                    value={values.floor}
                    onChange={(e) => setField("floor", e.target.value)}
                    placeholder="e.g. 5th"
                    disabled={isSaving}
                    className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                  />
                  {errors.floor ? <p className="text-[11px] text-rose-400 ml-1">{errors.floor}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 gap-3 pt-6 border-t border-white/[0.06]">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSaving}
            className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={save} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? "Saving..." : "Commit Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

