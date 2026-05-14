import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  CreditCard,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FeePaymentCardProps {
  /**
   * When set, the card operates in "viewer" mode (admin view / selecting another student).
   * In normal student dashboard mode, omit this prop and the card will use the authenticated session.
   */
  viewerProfileId?: string;
  /**
   * In admin view mode, students must not be able to pay.
   */
  canPay?: boolean;
}

type FeeStatus = "pending" | "partially_paid" | "paid" | "overdue";
type PaymentMethod = "UPI" | "Card" | "Net Banking" | "Cash";

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
};

type FeePaymentRow = {
  id: string;
  fee_id: string;
  student_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  payment_status: "success" | "failed" | "pending";
  paid_at: string;
};

const FeePaymentCard: React.FC<FeePaymentCardProps> = ({
  viewerProfileId,
  canPay = true,
}) => {
  const { toast } = useToast();

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRow | null>(null);

  const [fees, setFees] = useState<FeeRow[]>([]);
  const [payments, setPayments] = useState<FeePaymentRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const requireSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("User not authenticated");
    return session;
  };

  const resolveStudentId = async () => {
    if (viewerProfileId) return viewerProfileId;
    const session = await requireSession();
    return session.user.id;
  };

  const fetchFeesAndPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const studentId = await resolveStudentId();

      const { data: feeRows, error: feeErr } = await supabase
        .from("fees")
        .select("id,student_id,title,description,amount,remaining_amount,due_date,status,created_at")
        .eq("student_id", studentId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (feeErr) throw feeErr;

      const { data: paymentRows, error: payErr } = await supabase
        .from("fee_payments")
        .select(
          "id,fee_id,student_id,amount_paid,payment_method,transaction_reference,payment_status,paid_at",
        )
        .eq("student_id", studentId)
        .order("paid_at", { ascending: false })
        .limit(10);
      if (payErr) throw payErr;

      setFees((feeRows || []) as any);
      setPayments((paymentRows || []) as any);
    } catch (e: any) {
      console.error("[FeePaymentCard] fetch error:", e);
      setFees([]);
      setPayments([]);
      setError(e?.message || "Failed to load fee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFeesAndPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerProfileId]);

  // Realtime
  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const start = async () => {
      try {
        const studentId = await resolveStudentId();

        channel = supabase
          .channel(`fees-and-payments-${studentId}`)
          .on(
            "postgres_changes",
            { schema: "public", table: "fees", event: "*", filter: `student_id=eq.${studentId}` },
            () => {
              if (!mounted) return;
              void fetchFeesAndPayments();
            },
          )
          .on(
            "postgres_changes",
            {
              schema: "public",
              table: "fee_payments",
              event: "*",
              filter: `student_id=eq.${studentId}`,
            },
            () => {
              if (!mounted) return;
              void fetchFeesAndPayments();
            },
          )
          .subscribe();
      } catch (e) {
        console.warn("[FeePaymentCard] realtime subscription failed:", e);
      }
    };

    void start();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerProfileId]);

  const totals = useMemo(() => {
    const total = fees.reduce((s, f) => s + (Number(f.amount) || 0), 0);
    const remaining = fees.reduce((s, f) => s + (Number(f.remaining_amount) || 0), 0);
    const paid = Math.max(0, total - remaining);
    const pct = total > 0 ? (paid / total) * 100 : 0;
    return { total, remaining, paid, pct };
  }, [fees]);

  const upcomingDue = useMemo(() => {
    const pending = fees
      .filter((f) => f.remaining_amount > 0)
      .filter((f) => !!f.due_date)
      .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));
    return pending[0]?.due_date ?? null;
  }, [fees]);

  const pendingFees = useMemo(
    () => fees.filter((f) => f.remaining_amount > 0).sort((a, b) => {
      const ad = a.due_date ? String(a.due_date) : "9999-12-31";
      const bd = b.due_date ? String(b.due_date) : "9999-12-31";
      return ad.localeCompare(bd);
    }),
    [fees],
  );
  const paidFees = useMemo(() => fees.filter((f) => f.remaining_amount <= 0), [fees]);

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

  const statusBadge = (s: FeeStatus) => {
    if (s === "paid")
      return (
        <Badge className="border-emerald-500/35 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20">
          Paid
        </Badge>
      );
    if (s === "partially_paid")
      return (
        <Badge className="border-sky-500/35 bg-sky-500/15 text-sky-100 hover:bg-sky-500/20">
          Partially paid
        </Badge>
      );
    if (s === "overdue")
      return (
        <Badge className="border-red-500/40 bg-red-500/15 text-red-100 hover:bg-red-500/25">
          Overdue
        </Badge>
      );
    return (
      <Badge className="border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.09]">
        Pending
      </Badge>
    );
  };

  const openPay = (fee: FeeRow) => {
    setSelectedFee(fee);
    setPayAmount(String(Number(fee.remaining_amount) || 0));
    setPaymentMethod("UPI");
    setTransactionReference("");
    setPaymentNote("");
    setIsPayDialogOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedFee) return;
    const amt = Number(payAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    if (amt > Number(selectedFee.remaining_amount)) {
      toast({
        title: "Amount too high",
        description: "Payment amount cannot exceed remaining amount.",
        variant: "destructive",
      });
      return;
    }
    if (!transactionReference.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Please enter a transaction reference / mock payment id.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("record_fee_payment", {
        p_fee_id: selectedFee.id,
        p_amount_paid: amt,
        p_payment_method: paymentMethod,
        p_transaction_reference: transactionReference.trim(),
      });
      if (rpcErr) throw rpcErr;

      toast({
        title: "Payment recorded",
        description: `${formatINR(amt)} paid via ${paymentMethod}.`,
      });

      // Optional note stored client-side only for now (no reports/audit fields requested).
      void data;
      void paymentNote;

      setIsPayDialogOpen(false);
      setSelectedFee(null);
      await fetchFeesAndPayments();
    } catch (e: any) {
      console.error("[FeePaymentCard] payment error:", e);
      toast({
        title: "Payment failed",
        description: e?.message || "Could not record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="workspace-surface-panel h-full w-full overflow-hidden">
      <CardHeader className="workspace-surface-panel-header pb-4">
        <CardTitle className="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-tight text-slate-50">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-emerald-900/55 to-teal-950/50 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <DollarSign className="h-5 w-5" strokeWidth={1.75} />
          </span>
          Fee payment status
        </CardTitle>
        <CardDescription className="text-[13px] leading-relaxed text-slate-500">
          Ledger clarity for dues, settlements, and receipts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400/80" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{error}</span>
            <Button
              size="sm"
              variant="outline"
              className="border-red-400/40 bg-transparent text-red-50 hover:bg-red-500/15"
              onClick={fetchFeesAndPayments}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
          <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Settlement progress</span>
            <span className="text-[13px] font-semibold tabular-nums text-slate-50">
              {Math.round(totals.pct)}%
            </span>
          </div>
          <Progress
            value={totals.pct}
            className="h-2 bg-white/10 [&_span]:bg-gradient-to-r [&_span]:from-emerald-400 [&_span]:to-cyan-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Total fees</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-slate-50">
              {formatINR(totals.total)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Remaining</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-slate-50">
              {formatINR(totals.remaining)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
          <CalendarIcon className="h-4 w-4 shrink-0 text-amber-200" />
          <div>
            <p className="text-xs font-medium text-amber-100">Next due date</p>
            <p className="text-xs text-amber-100/90">
              {upcomingDue ? (
                <span>{new Date(upcomingDue).toLocaleDateString("en-IN")}</span>
              ) : (
                <span className="font-medium text-amber-200/90">No upcoming due date</span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-slate-200">Pending fees</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">Amounts owed and awaiting settlement</p>
          </div>
          {pendingFees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.025] px-4 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <CreditCard className="h-7 w-7 text-slate-600 opacity-80" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-semibold text-slate-300">All clear for now</p>
                <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-relaxed text-slate-500">
                  Pending line items surface when the office posts new dues. Fee transactions populate here once
                  payments begin.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[140px] space-y-1.5 overflow-y-auto pr-1">
              {pendingFees.slice(0, 3).map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/15"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-xs font-semibold text-slate-100">{fee.title}</p>
                      {statusBadge(fee.status)}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      Remaining: {formatINR(Number(fee.remaining_amount))}
                      {fee.due_date ? (
                        <span> • Due {new Date(fee.due_date).toLocaleDateString("en-IN")}</span>
                      ) : null}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500"
                    onClick={() => openPay(fee)}
                    disabled={!canPay}
                  >
                    Pay now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-3 border-t border-white/5 pt-5">
        <Dialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/[0.07]"
            >
              <FileText className="mr-2 h-4 w-4" />
              Payment history
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[min(90vh,520px)] overflow-y-auto">
            <DialogHeader className="border-0 pb-0">
              <DialogTitle>Payment history</DialogTitle>
              <DialogDescription className="text-slate-500">
                Complete record of your hostel fee payments
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div key={p.id} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-400">Date</span>
                      <span className="text-slate-100">{new Date(p.paid_at).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-400">Amount</span>
                      <span className="font-semibold text-slate-50">{formatINR(Number(p.amount_paid))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-400">Method</span>
                      <span>{p.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-400">Reference</span>
                      <span className="max-w-[240px] truncate text-right">
                        {p.transaction_reference || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-400">Status</span>
                      <Badge
                        className={
                          p.payment_status === "success"
                            ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-100"
                            : "border-white/15 bg-white/[0.06] text-slate-200"
                        }
                      >
                        {p.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-11 text-center">
                  <CreditCard className="h-9 w-9 text-slate-600 opacity-75" strokeWidth={1.4} />
                  <p className="text-[13px] font-semibold text-slate-400">No recorded payments yet</p>
                  <p className="max-w-[280px] text-[12px] leading-relaxed text-slate-500">
                    Settlement receipts will accumulate here automatically after successful transactions.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="flex items-center bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500"
              onClick={() => {
                const first = pendingFees[0] ?? null;
                if (!first) return;
                openPay(first);
              }}
              disabled={!canPay || pendingFees.length === 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Pay now
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[min(90vh,680px)] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader className="border-0 pb-0">
              <DialogTitle>Pay fee</DialogTitle>
              <DialogDescription className="text-slate-500">
                {selectedFee ? (
                  <span>
                    Paying <span className="font-medium">{selectedFee.title}</span> (Remaining{" "}
                    {formatINR(Number(selectedFee.remaining_amount))})
                  </span>
                ) : (
                  "Select a fee to pay."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-300">Payment method</label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    disabled={!selectedFee}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Net Banking">Net Banking</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Amount (₹)</label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    step={1}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    disabled={!selectedFee}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Transaction reference / payment id</label>
                <Input
                  className="mt-1"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. UPI-REF-12345"
                  disabled={!selectedFee}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Mock reference for now (no live gateway yet).
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
                <Textarea
                  className="mt-1"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Any extra info (optional)"
                  disabled={!selectedFee}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPayDialogOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
                  onClick={submitPayment}
                  disabled={actionLoading || !selectedFee}
                >
                  {actionLoading ? "Processing…" : "Confirm payment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default FeePaymentCard;
