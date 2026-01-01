
# 🌿 Serenity Massage: Production SQL Schema

Run this in your **Supabase SQL Editor** to establish the core clinical database. This script is designed to be safe to run multiple times.

```sql
-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (Matches names exactly to avoid 42710 policy errors)
DROP POLICY IF EXISTS "Public: Insert Clients" ON public.clients;
DROP POLICY IF EXISTS "Public: Select Clients" ON public.clients;
DROP POLICY IF EXISTS "Public: Insert Appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff: All Clients" ON public.clients;
DROP POLICY IF EXISTS "Staff: All Appointments" ON public.appointments;

-- 4. NEW SECURE POLICIES
-- Clients: Public can insert and select (required for the .insert().select() flow)
CREATE POLICY "Public: Insert Clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public: Select Clients" ON public.clients FOR SELECT USING (true);

-- Appointments: Public can insert
CREATE POLICY "Public: Insert Appointments" ON public.appointments FOR INSERT WITH CHECK (true);

-- Staff: Full access to everything when logged in
CREATE POLICY "Staff: All Clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff: All Appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- 5. Enable Realtime (Idempotent Check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'appointments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
    END IF;
END $$;
```
