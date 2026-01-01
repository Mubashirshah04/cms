
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjrfahgissujcywvclwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmZhaGdpc3N1amN5d3ZjbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNDkxMzYsImV4cCI6MjA4MjgyNTEzNn0.SUlQ9yUVWTXfQZOdtY_4ZsZUdU426Wqetbjjc8lFJic';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: { 'x-application-name': 'serenity-booking-ultra' }
  }
});
