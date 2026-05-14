import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { AdminTableClasses } from "./premium/AdminOperationsCard";
import { adminVisual } from "./premium/admin-visual-system";

type FeeStatus = "pending" | "partially_paid" | "paid" | "overdue";

type StudentProfile = {
  id: string;
  full_name: string | null;
  student_id: string | null;
};

type FeeRow = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  amount: number;
  remaining_amount: number;
  due_date: string | null;
  status: FeeStatus;
  created_at: string;
  profiles?: { full_name: string | null; student_id: string | null } | null;

  // Derived data (latest successful fee payment timestamp)
  paid_on?: string | null;
};


function formatINR(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safe);
}

const statusBadge = (s: FeeStatus) => {
  switch (s) {
    case "paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>
      );
    case "partially_paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">PARTIAL</span>
      );
    case "overdue":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">OVERDUE</span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>
      );
  }
};

interface AdminFeesProps {
  students: StudentProfile[];
}

export default function AdminFees({ students }: AdminFeesProps) {
  const { toast } = useToast();
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all");

  // Bulk Issuance State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [feeTitle, setFeeTitle] = useState("Semester Fee");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeDueDate, setFeeDueDate] = useState("");
  const [feeDescription, setFeeDescription] = useState("");

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRow | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState<FeeStatus>("pending");
  const [editDescription, setEditDescription] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data, error: err } = await supabase
        .from("fees")
        .select(`
          *,
          profiles:student_id (full_name, student_id)
        `)
        .order("created_at", { ascending: false });

      if (err) throw err;
      
      // Also fetch payments to derive paid_on
      const { data: payments } = await supabase
        .from("fee_payments")
        .select("fee_id, created_at, status")
        .eq("status", "success")
        .order("created_at", { ascending: false });

      const feesWithPayments = (data || []).map((fee: any) => {
        const lastPayment = payments?.find(p => p.fee_id === fee.id);
        return {
          ...fee,
          paid_on: lastPayment ? lastPayment.created_at : null
        };
      });

      setFees(feesWithPayments);
    } catch (err) {
      console.error("Error fetching fees:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const resetAssignForm = () => {
    setSelectedStudentIds([]);
    setFeeTitle("Semester Fee");
    setFeeAmount("");
    setFeeDueDate("");
    setFeeDescription("");
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllFilteredStudents = (query: string) => {
    const q = query.trim().toLowerCase();
    const filteredIds = students
      .filter((s) => {
        if (!q) return true;
        return (
          (s.full_name || "").toLowerCase().includes(q) ||
          (s.student_id || "").toLowerCase().includes(q)
        );
      })
      .map((s) => s.id);
    
    setSelectedStudentIds(filteredIds);
  };

  const assignFees = async () => {
    if (selectedStudentIds.length === 0) {
      toast({ title: "Selection Required", description: "Select at least one student.", variant: "destructive" });
      return;
    }
    if (!feeAmount || Number(feeAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Enter a valid fee amount.", variant: "destructive" });
      return;
    }

    try {
      setAssignLoading(true);
      const amountNum = Number(feeAmount);
      const inserts = selectedStudentIds.map((sid) => ({
        student_id: sid,
        title: feeTitle,
        amount: amountNum,
        remaining_amount: amountNum,
        due_date: feeDueDate || null,
        description: feeDescription || null,
        status: "pending",
      }));

      const { error: err } = await supabase.from("fees").insert(inserts);
      if (err) throw err;

      toast({ title: "Invoices Generated", description: `Successfully issued ${selectedStudentIds.length} invoices.` });
      setAssignOpen(false);
      resetAssignForm();
      fetchFees();
    } catch (err: any) {
      toast({ title: "Issuance Failed", description: err.message, variant: "destructive" });
    } finally {
      setAssignLoading(false);
    }
  };

  const openEdit = (fee: FeeRow) => {
    setEditingFee(fee);
    setEditAmount(String(fee.amount));
    setEditDueDate(fee.due_date || "");
    setEditStatus(fee.status);
    setEditDescription(fee.description || "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingFee) return;
    try {
      setEditLoading(true);
      const { error: err } = await supabase
        .from("fees")
        .update({
          amount: Number(editAmount),
          remaining_amount: Number(editAmount), 
          due_date: editDueDate || null,
          status: editStatus,
          description: editDescription || null,
        })
        .eq("id", editingFee.id);

      if (err) throw err;

      toast({ title: "Record Updated", description: "Fee invoice synchronized successfully." });
      setEditOpen(false);
      fetchFees();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const deleteFee = async (id: string) => {
    try {
      const { error: err } = await supabase.from("fees").delete().eq("id", id);
      if (err) throw err;
      toast({ title: "Invoice Voided", description: "Record purged from ledger." });
      fetchFees();
    } catch (err: any) {
      toast({ title: "Purge Failed", description: err.message, variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    return fees.filter((f) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (f.profiles?.full_name || "").toLowerCase().includes(q) ||
        (f.profiles?.student_id || "").toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [fees, search, statusFilter]);

  return (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="h-9 border-white/[0.08] bg-white/[0.03] text-xs font-bold text-slate-200 hover:bg-white/[0.06] px-4" 
            onClick={() => void fetchFees()} 
            disabled={loading}
          >
            Refresh Ledger
          </Button>
          <Dialog open={assignOpen} onOpenChange={(o) => (setAssignOpen(o), !o && resetAssignForm())}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 px-6 shadow-lg shadow-indigo-500/20">
                Issue Fee Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[820px] bg-slate-950/95 border-white/[0.08] backdrop-blur-xl text-slate-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]">
              <DialogHeader className="border-b border-white/[0.06] pb-5 mb-2">
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-50">Bulk Fee Issuance</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">Select target students and configure invoice parameters.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Target Selection ({selectedStudentIds.length})</p>
                  </div>

                  <Input
                    placeholder="Search database..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAllFilteredStudents(search)}
                      className="text-[11px] font-bold border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                    >
                      Match Search
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-[11px] font-bold border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                    >
                      Clear All
                    </Button>
                  </div>

                  <ScrollArea className="h-[340px] rounded-xl border border-white/[0.06] bg-black/20 p-3">
                    {students.length === 0 ? (
                      <p className="text-[12px] text-slate-600 italic p-4 text-center">No matching records found.</p>
                    ) : (
                      <div className="space-y-1 pr-3">
                        {students
                          .filter((s) => {
                            const q = search.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              (s.full_name || "").toLowerCase().includes(q) ||
                              (s.student_id || "").toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 250)
                          .map((s) => (
                            <label
                              key={s.id}
                              className={clsx(
                                "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors border border-transparent",
                                selectedStudentIds.includes(s.id) 
                                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-100" 
                                  : "hover:bg-white/[0.03] text-slate-400 hover:text-slate-200"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(s.id)}
                                onChange={() => toggleStudent(s.id)}
                                className="accent-indigo-500"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-bold truncate">
                                  {s.full_name || "Unnamed"}
                                </span>
                                <span className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">
                                  {s.student_id || s.id.slice(0, 8)}
                                </span>
                              </div>
                            </label>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                  <p className="text-[10px] text-slate-500 italic bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    Pro Tip: Use identifiers for high-precision bulk selection.
                  </p>
                </div>

                <div className="space-y-5 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Invoice Template</label>
                    <Select value={feeTitle} onValueChange={setFeeTitle}>
                      <SelectTrigger className="bg-slate-950/50 border-white/[0.1] text-slate-200">
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
                        <SelectItem value="Semester Fee">Semester Fee</SelectItem>
                        <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                        <SelectItem value="Hostel Fee">Hostel Fee</SelectItem>
                        <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                        <SelectItem value="Exam Fee">Exam Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Value (₹)</label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Maturity Date</label>
                      <Input
                        type="date"
                        value={feeDueDate}
                        onChange={(e) => setFeeDueDate(e.target.value)}
                        className="bg-slate-950/50 border-white/[0.1] text-slate-200 focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Internal Description</label>
                    <Textarea
                      value={feeDescription}
                      onChange={(e) => setFeeDescription(e.target.value)}
                      placeholder="Audit trail notes..."
                      className="min-h-[100px] bg-slate-950/50 border-white/[0.1] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                    />
                  </div>

                  <DialogFooter className="pt-6 border-t border-white/[0.06]">
                    <Button 
                      variant="outline" 
                      onClick={() => setAssignOpen(false)} 
                      disabled={assignLoading}
                      className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={assignFees} 
                      disabled={assignLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-500/20"
                    >
                      {assignLoading ? "Processing..." : "Generate Invoices"}
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Filter by name, identifier or invoice title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-white/[0.08] bg-slate-950/40 text-slate-100 placeholder:text-slate-600 md:max-w-[440px] h-10"
        />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-10 w-[200px] border-white/[0.08] bg-slate-950/40 text-xs font-bold text-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="paid">Settled (Paid)</SelectItem>
              <SelectItem value="overdue">Delinquent (Overdue)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={clsx(AdminTableClasses.container, adminVisual.dataPlate)}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/[0.08] border-t-indigo-500" />
          </div>
        ) : error ? (
          <div className="border border-rose-500/25 bg-rose-500/[0.07] p-8 text-sm text-rose-100 text-center rounded-2xl">
            <div className="font-black uppercase tracking-widest text-rose-400 mb-2">Connectivity Error</div>
            <div className="text-slate-400">Failed to sync with financial ledger. Verify session or permissions.</div>
            <Button onClick={() => void fetchFees()} variant="outline" className="mt-6 border-rose-500/20 text-rose-200 hover:bg-rose-500/10">Try Re-Sync</Button>
          </div>
        ) : (
          <table className={AdminTableClasses.table}>
            <thead className={AdminTableClasses.thead}>
              <tr>
                <th className={AdminTableClasses.th}>Student Profile</th>
                <th className={AdminTableClasses.th}>Invoice Specification</th>
                <th className={clsx(AdminTableClasses.th, "text-right")}>Total Value</th>
                <th className={clsx(AdminTableClasses.th, "text-right")}>Outstanding</th>
                <th className={AdminTableClasses.th}>Maturity</th>
                <th className={AdminTableClasses.th}>Settlement</th>
                <th className={AdminTableClasses.th}>Status</th>
                <th className={clsx(AdminTableClasses.th, "text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody className={AdminTableClasses.tbody}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={clsx(AdminTableClasses.td, "py-24 text-center text-slate-500 italic font-medium")}>
                    No records matched the current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className={AdminTableClasses.tr}>
                    <td className={AdminTableClasses.td}>
                      <div className="min-w-0">
                        <div className={AdminTableClasses.primaryText}>{f.profiles?.full_name || "Student"}</div>
                        <div className={AdminTableClasses.monoText}>{f.profiles?.student_id || f.student_id}</div>
                      </div>
                    </td>
                    <td className={AdminTableClasses.td}>
                      <div className="min-w-0">
                        <div className={AdminTableClasses.primaryText}>{f.title}</div>
                        {f.description ? (
                          <div className={AdminTableClasses.secondaryText}>{f.description}</div>
                        ) : null}
                      </div>
                    </td>
                    <td className={clsx(AdminTableClasses.td, "text-right tabular-nums font-bold text-slate-100 group-hover:text-white")}>
                      {formatINR(Number(f.amount))}
                    </td>
                    <td className={clsx(AdminTableClasses.td, "text-right tabular-nums font-bold text-slate-50")}>
                      {formatINR(Number(f.remaining_amount))}
                    </td>
                    <td className={clsx(AdminTableClasses.td, "tabular-nums text-slate-300 font-bold")}>
                      {f.due_date ? new Date(f.due_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "—"}
                    </td>
                    <td className={clsx(AdminTableClasses.td, "text-[11px] text-slate-400 font-mono")}>
                      {f.paid_on ? (
                        <span title={new Date(f.paid_on).toISOString()} className="text-emerald-400/80">
                          {new Date(f.paid_on).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={AdminTableClasses.td}>{statusBadge(f.status)}</td>
                    <td className={clsx(AdminTableClasses.td, "text-right")}>
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/[0.08] bg-transparent px-3 text-[11px] font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          type="button"
                          onClick={() => openEdit(f)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-8 px-3 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">
                              Void
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-950/95 border-white/[0.08] backdrop-blur-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-50 font-bold">Void Invoice?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400 font-medium">
                                This will permanently purge this fee record from the ledger. This action cannot be reversed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/[0.1] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => void deleteFee(f.id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                              >
                                Void Record
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => (setEditOpen(o), !o && setEditingFee(null))}>
        <DialogContent className="sm:max-w-[560px] bg-slate-950/95 border-white/[0.08] backdrop-blur-xl text-slate-100">
          <DialogHeader className="border-b border-white/[0.06] pb-5 mb-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-50">Modify Invoice Specs</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Adjust invoice value, maturity, and lifecycle status.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Value (₹)</label>
                <Input 
                  type="number" 
                  value={editAmount} 
                  onChange={(e) => setEditAmount(e.target.value)} 
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Maturity Date</label>
                <Input 
                  type="date" 
                  value={editDueDate} 
                  onChange={(e) => setEditDueDate(e.target.value)} 
                  className="bg-slate-950/50 border-white/[0.1] text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lifecycle Status</label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as FeeStatus)}>
                <SelectTrigger className="bg-slate-950/50 border-white/[0.1] text-slate-200 font-bold">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.1] text-slate-200">
                  <SelectItem value="pending">Pending Settlement</SelectItem>
                  <SelectItem value="partially_paid">Partially Settled</SelectItem>
                  <SelectItem value="paid">Settled (Paid)</SelectItem>
                  <SelectItem value="overdue">Delinquent (Overdue)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Audit Notes</label>
              <Textarea 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                className="min-h-[100px] bg-slate-950/50 border-white/[0.1] text-slate-200 italic"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-white/[0.06]">
              <Button 
                variant="outline" 
                onClick={() => setEditOpen(false)} 
                disabled={editLoading}
                className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveEdit} 
                disabled={editLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-500/20"
              >
                {editLoading ? "Syncing..." : "Update Record"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

