
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Fix: Access Deno through globalThis to avoid compilation errors in non-Deno environments
    const supabaseClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fullName, email, whatsapp, serviceType, date, time, notes } = await req.json()

    // 1. Create client
    const { data: client, error: clientErr } = await supabaseClient
      .from('clients')
      .insert([{ full_name: fullName, email, whatsapp_number: whatsapp }])
      .select()
      .single()

    if (clientErr) throw clientErr

    // 2. Create appointment
    const { error: apptErr } = await supabaseClient
      .from('appointments')
      .insert([{
        client_id: client.id,
        service_type: serviceType,
        appointment_date: date,
        appointment_time: time,
        notes,
        status: 'pending'
      }])

    if (apptErr) throw apptErr

    // 3. WhatsApp Notification (Twilio Example)
    // NOTE: Requires TWILIO_SID, TWILIO_TOKEN, etc in Supabase Secrets
    // Fix: Access Deno through globalThis
    const sid = (globalThis as any).Deno.env.get('TWILIO_ACCOUNT_SID')
    if (sid) {
       // Logic to call Twilio API here
       console.log("Triggering WhatsApp notification...")
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
