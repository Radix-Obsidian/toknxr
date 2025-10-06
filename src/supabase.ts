import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkdytotoptkknghtsomn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHl0b3RvcHRra25naHRzb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjI1OTgsImV4cCI6MjA3NTI5ODU5OH0.Y3RVJvx7w-eGD4Nv2aVv8jnkUKhmA2vpkBs7_rFzEoQ'

export const supabase = createClient(supabaseUrl, supabaseKey)