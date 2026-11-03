-- Migration: Create appointments table with Row-Level Security (RLS) and B-Tree indexes
-- Destination: supabase/migrations/20261101190000_create_appointments_table.sql

-- ==============================================================================
-- 1. Table: appointments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_appointments_updated_at ON public.appointments;
CREATE TRIGGER set_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 2. Performance: B-Tree Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id 
    ON public.appointments USING btree (therapist_id);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id 
    ON public.appointments USING btree (patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at 
    ON public.appointments USING btree (scheduled_at);

-- ==============================================================================
-- 3. Security: Row-Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow participants to view their own appointments
DROP POLICY IF EXISTS "Allow participants to view their own appointments" ON public.appointments;
CREATE POLICY "Allow participants to view their own appointments"
    ON public.appointments
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = therapist_id 
        OR (SELECT auth.uid()) = patient_id
    );

-- Policy: Allow participants to update appointment status
DROP POLICY IF EXISTS "Allow participants to update appointment status" ON public.appointments;
CREATE POLICY "Allow participants to update appointment status"
    ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT auth.uid()) = therapist_id 
        OR (SELECT auth.uid()) = patient_id
    )
    WITH CHECK (
        (SELECT auth.uid()) = therapist_id 
        OR (SELECT auth.uid()) = patient_id
    );
