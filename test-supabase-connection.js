require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('ai_services').select('*').limit(1);
    if (error) {
      console.error('Connection failed with error:', error.message);
      console.error('Full error:', error);
    } else {
      console.log('Connection successful!');
      console.log('Sample data from ai_services:', data);
    }
  } catch (err) {
    console.error('Unexpected error during connection test:', err.message);
  }
}

testConnection();