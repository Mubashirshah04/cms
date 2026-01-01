
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * SETUP:
 * supabase secrets set TWILIO_ACCOUNT_SID=your_sid
 * supabase secrets set TWILIO_AUTH_TOKEN=your_token
 * supabase secrets set TWILIO_FROM_NUMBER=whatsapp:+14155238886 (Twilio Sandbox)
 * supabase secrets set ADMIN_WHATSAPP_NUMBER=whatsapp:+YOUR_NUMBER
 */

// Fix: Use globalThis to access Deno safely in environments where the global might not be recognized by types
const TWILIO_SID = (globalThis as any).Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = (globalThis as any).Deno.env.get('TWILIO_AUTH_TOKEN');
const FROM_NUMBER = (globalThis as any).Deno.env.get('TWILIO_FROM_NUMBER');
const ADMIN_NUMBER = (globalThis as any).Deno.env.get('ADMIN_WHATSAPP_NUMBER');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { clientName, service, date, time, clientWhatsapp } = await req.json();

    if (!TWILIO_SID || !TWILIO_TOKEN) {
      throw new Error("Missing Twilio configuration secrets");
    }

    const authHeader = `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`;

    // 1. Notify Client
    const clientResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: FROM_NUMBER!,
        To: `whatsapp:${clientWhatsapp}`,
        Body: `Hello ${clientName}! 🌿 Your session for ${service} is booked for ${date} at ${time}. We look forward to seeing you at Serenity Massage.`,
      }),
    });

    // 2. Notify Admin
    const adminResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: FROM_NUMBER!,
        To: ADMIN_NUMBER!,
        Body: `🛎️ NEW BOOKING: ${clientName} scheduled a ${service} session on ${date} at ${time}.`,
      }),
    });

    const clientData = await clientResponse.json();
    const adminData = await adminResponse.json();

    return new Response(
      JSON.stringify({ success: true, clientSid: clientData.sid, adminSid: adminData.sid }), 
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  }
})
