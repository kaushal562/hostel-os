-- Hostel Fee Management + Student Payment system
-- Source of truth: Supabase (Postgres)
-- Includes: fees, fee_payments, RPC for secure payments, notifications triggers, RLS policies

BEGIN;

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_status') THEN
    CREATE TYPE public.fee_status AS ENUM ('pending', 'partially_paid', 'paid', 'overdue');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_payment_method') THEN
    CREATE TYPE public.fee_payment_method AS ENUM ('UPI', 'Card', 'Net Banking', 'Cash');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_payment_status') THEN
    CREATE TYPE public.fee_payment_status AS ENUM ('success', 'failed', 'pending');
  END IF;
END $$;

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  remaining_amount numeric(12,2) NOT NULL CHECK (remaining_amount >= 0),
  due_date date,
  status public.fee_status NOT NULL DEFAULT 'pending',
  created_by_admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fees_student_id_idx ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS fees_status_idx ON public.fees(status);
CREATE INDEX IF NOT EXISTS fees_due_date_idx ON public.fees(due_date);

CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id uuid NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paid numeric(12,2) NOT NULL CHECK (amount_paid > 0),
  payment_method public.fee_payment_method NOT NULL,
  transaction_reference text,
  payment_status public.fee_payment_status NOT NULL DEFAULT 'success',
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fee_payments_fee_id_idx ON public.fee_payments(fee_id);
CREATE INDEX IF NOT EXISTS fee_payments_student_id_idx ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS fee_payments_paid_at_idx ON public.fee_payments(paid_at DESC);

-- 3) Timestamp + consistency triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fees_set_updated_at ON public.fees;
CREATE TRIGGER fees_set_updated_at
BEFORE UPDATE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.fees_init_remaining_amount()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.remaining_amount IS NULL THEN
    NEW.remaining_amount = NEW.amount;
  END IF;

  IF NEW.remaining_amount > NEW.amount THEN
    NEW.remaining_amount = NEW.amount;
  END IF;

  IF NEW.amount = 0 THEN
    NEW.remaining_amount = 0;
    NEW.status = 'paid';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fees_init_remaining_amount_trg ON public.fees;
CREATE TRIGGER fees_init_remaining_amount_trg
BEFORE INSERT ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.fees_init_remaining_amount();

CREATE OR REPLACE FUNCTION public.fees_derive_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  is_overdue boolean;
BEGIN
  IF NEW.remaining_amount <= 0 THEN
    NEW.remaining_amount = 0;
    NEW.status = 'paid';
    RETURN NEW;
  END IF;

  IF NEW.remaining_amount < NEW.amount THEN
    NEW.status = 'partially_paid';
  ELSE
    NEW.status = 'pending';
  END IF;

  is_overdue := (NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE);
  IF is_overdue THEN
    NEW.status = 'overdue';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fees_derive_status_trg ON public.fees;
CREATE TRIGGER fees_derive_status_trg
BEFORE INSERT OR UPDATE OF amount, remaining_amount, due_date ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.fees_derive_status();

-- 4) Notifications triggers (uses existing public.notifications)
CREATE OR REPLACE FUNCTION public.notify_on_fee_assigned()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.notifications(user_id, title, message, type)
  VALUES (
    NEW.student_id,
    'New Fee Assigned',
    'You have a new ' || NEW.title || ' assigned.',
    'info'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fees_notify_assigned_trg ON public.fees;
CREATE TRIGGER fees_notify_assigned_trg
AFTER INSERT ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.notify_on_fee_assigned();

CREATE OR REPLACE FUNCTION public.notify_on_fee_payment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payment_status = 'success' THEN
    INSERT INTO public.notifications(user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Payment Successful',
      'Your payment of ₹' || NEW.amount_paid::text || ' was successful.',
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fee_payments_notify_paid_trg ON public.fee_payments;
CREATE TRIGGER fee_payments_notify_paid_trg
AFTER INSERT ON public.fee_payments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_fee_payment();

CREATE OR REPLACE FUNCTION public.notify_on_fee_overdue()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'overdue' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications(user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Fee Overdue',
      'Your fee payment is overdue (' || NEW.title || ').',
      'warning'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fees_notify_overdue_trg ON public.fees;
CREATE TRIGGER fees_notify_overdue_trg
AFTER UPDATE OF status ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.notify_on_fee_overdue();

-- 5) RPC: record_fee_payment (atomic, secure)
-- Students pay their own fees; admins may pay/record on behalf if needed.
CREATE OR REPLACE FUNCTION public.record_fee_payment(
  p_fee_id uuid,
  p_amount_paid numeric,
  p_payment_method public.fee_payment_method,
  p_transaction_reference text
)
RETURNS TABLE (
  fee_id uuid,
  payment_id uuid,
  new_remaining_amount numeric,
  new_status public.fee_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee public.fees%ROWTYPE;
  v_is_admin boolean;
  v_new_remaining numeric(12,2);
  v_payment_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_fee
  FROM public.fees
  WHERE id = p_fee_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fee not found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ) INTO v_is_admin;

  IF (NOT v_is_admin) AND v_fee.student_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not allowed to pay this fee';
  END IF;

  IF p_amount_paid IS NULL OR p_amount_paid <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  IF v_fee.remaining_amount <= 0 THEN
    RAISE EXCEPTION 'Fee already paid';
  END IF;

  IF p_amount_paid > v_fee.remaining_amount THEN
    RAISE EXCEPTION 'Amount exceeds remaining amount';
  END IF;

  INSERT INTO public.fee_payments(
    fee_id,
    student_id,
    amount_paid,
    payment_method,
    transaction_reference,
    payment_status,
    paid_at
  )
  VALUES (
    v_fee.id,
    v_fee.student_id,
    p_amount_paid,
    p_payment_method,
    NULLIF(trim(p_transaction_reference), ''),
    'success',
    now()
  )
  RETURNING id INTO v_payment_id;

  v_new_remaining := v_fee.remaining_amount - p_amount_paid;
  IF v_new_remaining < 0 THEN
    v_new_remaining := 0;
  END IF;

  UPDATE public.fees
  SET remaining_amount = v_new_remaining
  WHERE id = v_fee.id;

  SELECT f.id, v_payment_id, f.remaining_amount, f.status
  INTO fee_id, payment_id, new_remaining_amount, new_status
  FROM public.fees f
  WHERE f.id = v_fee.id;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.record_fee_payment(uuid, numeric, public.fee_payment_method, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_fee_payment(uuid, numeric, public.fee_payment_method, text) TO authenticated;

-- 6) RLS
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Clean previous policies (safe if absent)
DROP POLICY IF EXISTS "fees_student_select_own" ON public.fees;
DROP POLICY IF EXISTS "fees_admin_all" ON public.fees;
DROP POLICY IF EXISTS "fee_payments_student_select_own" ON public.fee_payments;
DROP POLICY IF EXISTS "fee_payments_admin_all" ON public.fee_payments;

-- Students: can only SELECT their own fees
CREATE POLICY "fees_student_select_own"
  ON public.fees
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Admins: can manage all fee records
CREATE POLICY "fees_admin_all"
  ON public.fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Students: can SELECT their own payment history
CREATE POLICY "fee_payments_student_select_own"
  ON public.fee_payments
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Admins: can manage all payment records
CREATE POLICY "fee_payments_admin_all"
  ON public.fee_payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMIT;

