import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.SUPABASE_URL || 'https://pkdytotoptkknghtsomn.supabase.co';
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHl0b3RvcHRra25naHRzb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjI1OTgsImV4cCI6MjA3NTI5ODU5OH0.Y3RVJvx7w-eGD4Nv2aVv8jnkUKhmA2vpkBs7_rFzEoQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const setAuthToken = (token: string) => {
  supabase.auth.setSession({ access_token: token, refresh_token: '' });
};
