const { createClient } = require('@supabase/supabase-js');

const url = 'https://pkdytotoptkknghtsomn.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHl0b3RvcHRra25naHRzb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjI1OTgsImV4cCI6MjA3NTI5ODU5OH0.Y3RVJvx7w-eGD4Nv2aVv8jnkUKhmA2vpkBs7_rFzEoQ';

try {
  const supabase = createClient(url, key);
  console.log('Supabase client created successfully');
  // Use the supabase client to avoid unused variable warning
  console.log('Client URL:', supabase.supabaseUrl);
} catch (error) {
  console.error('Error creating client:', error.message);
}